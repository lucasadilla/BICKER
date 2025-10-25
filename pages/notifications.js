import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import dbConnect from '../lib/dbConnect';
import Notification from '../models/Notification';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';

const formatDate = (value) => {
    if (!value) {
        return '';
    }

    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        return date.toLocaleString();
    } catch (error) {
        return '';
    }
};

export default function NotificationsPage({ notifications, page, totalPages }) {
    useEffect(() => {
        if (!notifications || notifications.length === 0) {
            return;
        }

        const unreadIds = notifications
            .filter((notification) => notification && notification._id && notification.read === false)
            .map((notification) => notification._id);

        if (unreadIds.length === 0) {
            return;
        }

        fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: unreadIds })
        }).catch(() => {});
    }, [notifications]);

    const hasNotifications = useMemo(() => notifications && notifications.length > 0, [notifications]);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <NextSeo title="Notifications" />
            <h1 style={{ fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>Notifications</h1>
            {!hasNotifications ? (
                <p style={{ textAlign: 'center', color: '#555555' }}>You have no notifications yet.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {notifications.map((notification) => {
                        const href = notification.debateId
                            ? `/deliberate?id=${encodeURIComponent(notification.debateId)}`
                            : null;
                        const formattedDate = formatDate(notification.createdAt);
                        const baseItemStyle = {
                            padding: '16px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            backgroundColor: notification.read ? '#f9f9f9' : '#ffffff',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        };

                        const content = (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '1rem', color: '#1f1f1f' }}>{notification.message}</span>
                                {formattedDate && (
                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{formattedDate}</span>
                                )}
                            </div>
                        );

                        return (
                            <li key={notification._id} style={baseItemStyle}>
                                {href ? (
                                    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {content}
                                    </Link>
                                ) : (
                                    content
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {totalPages > 1 && (
                <div
                    style={{
                        marginTop: '30px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '16px'
                    }}
                >
                    {page > 1 && (
                        <Link
                            href={`/notifications?page=${page - 1}`}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#1a73e8',
                                color: '#ffffff',
                                borderRadius: '999px',
                                textDecoration: 'none'
                            }}
                        >
                            Previous
                        </Link>
                    )}
                    <span style={{ fontSize: '0.95rem', color: '#4b5563' }}>
                        Page {page} of {totalPages}
                    </span>
                    {page < totalPages && (
                        <Link
                            href={`/notifications?page=${page + 1}`}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#1a73e8',
                                color: '#ffffff',
                                borderRadius: '999px',
                                textDecoration: 'none'
                            }}
                        >
                            Next
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (!session) {
        const protocol = context.req.headers['x-forwarded-proto'] || 'http';
        const host = context.req.headers['host'];
        const callbackUrl = `${protocol}://${host}${context.resolvedUrl || '/notifications'}`;

        return {
            redirect: {
                destination: `/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
                permanent: false
            }
        };
    }

    await dbConnect();

    const pageParam = Array.isArray(context.query.page) ? context.query.page[0] : context.query.page;
    const pageNumber = Math.max(parseInt(pageParam || '1', 10) || 1, 1);
    const limit = 25;
    const skip = (pageNumber - 1) * limit;

    const [notifications, totalCount] = await Promise.all([
        Notification.find({ userId: session.user.email })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Notification.countDocuments({ userId: session.user.email })
    ]);

    const serializedNotifications = notifications.map((notification) => ({
        _id: notification._id.toString(),
        message: notification.message,
        read: notification.read || false,
        debateId: notification.debateId ? notification.debateId.toString() : null,
        createdAt: notification.createdAt ? notification.createdAt.toISOString() : null
    }));

    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    return {
        props: {
            notifications: serializedNotifications,
            page: pageNumber,
            totalPages
        }
    };
}
