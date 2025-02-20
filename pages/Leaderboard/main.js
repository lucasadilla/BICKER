// pages/leaderboard/main.js
import { useRouter } from 'next/router';
import NavBar from '../../components/NavBar';

export default function LeaderboardIndex() {
    const router = useRouter();

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <NavBar />

            {/* Split screen */}
            <div style={{ flex: 1, display: 'flex' }}>
                {/* Left side: Global Stats */}
                <div
                    onClick={() => router.push('../leaderboard/global')}
                    style={{
                        flex: 1,
                        backgroundColor: '#FF4D4D',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FF6A6A')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF4D4D')}
                >
                    <h1 style={{ color: '#fff' }}>Global Stats</h1>
                </div>

                {/* Right side: Personal Stats */}
                <div
                    onClick={() => router.push('/leaderboard/personal')}
                    style={{
                        flex: 1,
                        backgroundColor: '#4D94FF',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#76ACFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4D94FF')}
                >
                    <h1 style={{ color: '#fff' }}>Personal Stats</h1>
                </div>
            </div>
        </div>
    );
}
