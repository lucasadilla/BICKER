import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import dbConnect from '../lib/dbConnect';
import Notification from '../models/Notification';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { useColorScheme } from '../lib/ColorSchemeContext';

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
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const pageBackground = isDarkMode ? '#000000' : '#4D94FF';
    const headingColor = isDarkMode ? '#f5f5f5' : '#ffffff';
    const mutedTextColor = isDarkMode ? '#d1d5db' : '#1f3a6f';
    const containerBackground = isDarkMode ? '#111111' : 'rgba(255, 255, 255, 0.95)';
    const containerTextColor = isDarkMode ? '#f5f5f5' : '#1f1f1f';
    const cardBorderColor = isDarkMode ? '#1f2937' : '#e0e0e0';
    const cardBackgroundRead = isDarkMode ? '#1a1a1a' : '#f5f7ff';
    const cardBackgroundUnread = isDarkMode ? '#151515' : '#ffffff';
    const cardShadow = isDarkMode
        ? '0 6px 14px rgba(0, 0, 0, 0.4)'
        : '0 6px 14px rgba(77, 148, 255, 0.15)';
    const dateColor = isDarkMode ? '#9ca3af' : '#4b5563';

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
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: pageBackground,
                padding: '60px 20px'
            }}
        >
            <NextSeo title="Notifications" />
            <div
                style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '40px 20px',
                    backgroundColor: containerBackground,
                    borderRadius: '16px',
                    boxShadow: isDarkMode
                        ? '0 12px 30px rgba(0, 0, 0, 0.45)'
                        : '0 12px 30px rgba(0, 0, 0, 0.12)',
                    color: containerTextColor
                }}
            >
                <h1
                    style={{
                        fontSize: '2rem',
                        marginBottom: '20px',
                        textAlign: 'center',
                        color: headingColor
                    }}
                >
                    Notifications
                </h1>
                {!hasNotifications ? (
                    <p style={{ textAlign: 'center', color: mutedTextColor }}>
                        You have no notifications yet.
                    </p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {notifications.map((notification) => {
                            const directUrl = typeof notification.url === 'string' && notification.url.trim() !== ''
                                ? notification.url.trim()
                                : null;
                            const href = directUrl
                                ? directUrl
                                : notification.debateId
                                    ? `/deliberate?id=${encodeURIComponent(notification.debateId)}`
                                    : null;
                            const formattedDate = formatDate(notification.createdAt);
                            const baseItemStyle = {
                                padding: '16px',
                                border: `1px solid ${cardBorderColor}`,
                                borderRadius: '12px',
                                marginBottom: '12px',
                                backgroundColor: notification.read
                                    ? cardBackgroundRead
                                    : cardBackgroundUnread,
                                boxShadow: cardShadow,
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            };

                            const content = (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <span style={{ fontSize: '1rem', color: containerTextColor }}>
                                        {notification.message}
                                    </span>
                                    {formattedDate && (
                                        <span style={{ fontSize: '0.875rem', color: dateColor }}>
                                            {formattedDate}
                                        </span>
                                    )}
                                </div>
                            );

                            return (
                                <li
                                    key={notification._id}
                                    style={baseItemStyle}
                                    onMouseEnter={(event) => {
                                        event.currentTarget.style.transform = 'translateY(-2px)';
                                        event.currentTarget.style.boxShadow = isDarkMode
                                            ? '0 10px 24px rgba(0, 0, 0, 0.5)'
                                            : '0 10px 24px rgba(77, 148, 255, 0.25)';
                                    }}
                                    onMouseLeave={(event) => {
                                        event.currentTarget.style.transform = 'translateY(0)';
                                        event.currentTarget.style.boxShadow = cardShadow;
                                    }}
                                >
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
                        <span style={{ fontSize: '0.95rem', color: mutedTextColor }}>
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

    const serializedNotifications = notifications.map((notification) => {
        let createdAt = null;
        if (notification.createdAt) {
            const dateValue = notification.createdAt instanceof Date
                ? notification.createdAt
                : new Date(notification.createdAt);
            if (!Number.isNaN(dateValue.getTime())) {
                createdAt = dateValue.toISOString();
            }
        }

        const directUrl = typeof notification.url === 'string' && notification.url.trim() !== ''
            ? notification.url.trim()
            : typeof notification.link === 'string' && notification.link.trim() !== ''
                ? notification.link.trim()
                : null;

        return {
            _id: notification._id.toString(),
            message: notification.message,
            read: notification.read || false,
            debateId: notification.debateId ? notification.debateId.toString() : null,
            createdAt,
            url: directUrl,
            type: notification.type || 'response'
        };
    });

    const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

    return {
        props: {
            notifications: serializedNotifications,
            page: pageNumber,
            totalPages
        }
    };
}
