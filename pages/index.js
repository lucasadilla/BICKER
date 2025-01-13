import Link from 'next/link';
import NavBar from '../components/NavBar';


export default function Home() {
    return (
        <div>
            <NavBar />
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h1>Welcome to Bicker</h1>
                <p>Select a page to start instigating debating!</p>
            </div>
        </div>
    );
}
