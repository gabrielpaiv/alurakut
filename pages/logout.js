import React from 'react';
import Box from '../src/components/Box';
import MainGrid from '../src/components/MainGrid';
import nookies from 'nookies';
import { useRouter } from 'next/router';
import LoginPage from './login';

export default function LogoutPage() {
    const router = useRouter();
    nookies.destroy(null, 'USER_TOKEN');
    return (
        <>
            <MainGrid>
                <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
                    <Box><p style={{ textAlign: 'center' }}>Você se desconectou!</p></Box>
                </div>
            </MainGrid>
            <LoginPage />
        </>
    );
}