import './globals.css'

export const metadata = {
    title: 'Secret Santa Generator',
    description: 'Ho Ho Ho! Assign your Secret Santas!',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <div className="snow-container">
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❄</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❄</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❄</div>
                </div>
                {children}
            </body>
        </html>
    )
}
