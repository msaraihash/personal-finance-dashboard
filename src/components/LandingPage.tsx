import { ArrowRight, Shield, Sparkles, DollarSign, Heart, ExternalLink } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Hero Section */}
            <section style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                maxWidth: '800px',
                margin: '0 auto',
            }}>
                {/* Logo/Brand */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '3rem',
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--nebula-purple), var(--nebula-teal))',
                        padding: '16px',
                        borderRadius: '20px',
                        boxShadow: '0 8px 24px rgba(167, 139, 250, 0.3)',
                    }}>
                        <Sparkles size={32} color="white" />
                    </div>
                    <span style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        color: 'var(--text-primary)',
                    }}>
                        WealthPath
                    </span>
                </div>

                {/* Headline */}
                <h1 style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    marginBottom: '1.5rem',
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, var(--nebula-purple-dark), var(--nebula-teal-dark))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    Track Your Path to Financial Freedom
                </h1>

                {/* Subheadline */}
                <p style={{
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
                    color: 'var(--text-secondary)',
                    marginBottom: '2.5rem',
                    lineHeight: 1.6,
                    maxWidth: '600px',
                }}>
                    A free, private calculator to visualize your journey to financial independence.
                    <strong style={{ color: 'var(--text-primary)' }}> Your data never leaves your browser.</strong>
                </p>

                {/* CTA Button */}
                <button
                    onClick={onGetStarted}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1.25rem 2.5rem',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        boxShadow: '0 12px 28px -8px rgba(15, 23, 42, 0.35)',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 16px 36px -8px rgba(15, 23, 42, 0.45)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 12px 28px -8px rgba(15, 23, 42, 0.35)';
                    }}
                >
                    Get Started — It's Free
                    <ArrowRight size={20} />
                </button>

                {/* Trust badges */}
                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    marginTop: '3rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}>
                    {[
                        { icon: Shield, text: '100% Private' },
                        { icon: DollarSign, text: 'Free Forever' },
                        { icon: Sparkles, text: 'No Account Required' },
                    ].map(({ icon: Icon, text }) => (
                        <div key={text} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                        }}>
                            <Icon size={18} color="var(--nebula-teal-dark)" />
                            {text}
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section style={{
                padding: '4rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(20px)',
            }}>
                <div style={{
                    maxWidth: '1000px',
                    margin: '0 auto',
                }}>
                    <h2 style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        marginBottom: '3rem',
                        color: 'var(--text-primary)',
                    }}>
                        Why WealthPath?
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.5rem',
                    }}>
                        {[
                            {
                                icon: Shield,
                                title: 'Your Data Stays Private',
                                description: 'Everything is stored locally in your browser. We never see, collect, or transmit your financial information.',
                                gradient: 'linear-gradient(135deg, #99f6e4, #5eead4)',
                            },
                            {
                                icon: Sparkles,
                                title: 'FI Calculator Built-In',
                                description: 'Visualize your path to financial independence with our interactive What-If calculator. See how changes affect your timeline.',
                                gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                            },
                            {
                                icon: DollarSign,
                                title: 'Canadian-Focused',
                                description: 'Designed for Canadians with multi-currency support, Wealthsimple CSV import, and CAD as the base currency.',
                                gradient: 'linear-gradient(135deg, #fbcfe8, #f472b6)',
                            },
                        ].map(({ icon: Icon, title, description, gradient }) => (
                            <div key={title} className="glass-card" style={{
                                padding: '2rem',
                                borderRadius: '20px',
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '14px',
                                    background: gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.25rem',
                                }}>
                                    <Icon size={24} color="white" />
                                </div>
                                <h3 style={{
                                    fontSize: '1.15rem',
                                    fontWeight: 700,
                                    marginBottom: '0.75rem',
                                    color: 'var(--text-primary)',
                                }}>
                                    {title}
                                </h3>
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.6,
                                    fontSize: '0.95rem',
                                }}>
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Support Section */}
            <section style={{
                padding: '4rem 1.5rem',
                textAlign: 'center',
            }}>
                <div style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(251, 207, 232, 0.3)',
                        borderRadius: '20px',
                        marginBottom: '1.5rem',
                    }}>
                        <Heart size={16} color="#ec4899" fill="#ec4899" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#be185d' }}>
                            Support the Project
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        marginBottom: '1rem',
                        color: 'var(--text-primary)',
                    }}>
                        Like what we're building?
                    </h2>

                    <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: '2rem',
                        lineHeight: 1.6,
                    }}>
                        WealthPath is free and always will be. If it's helped you on your FI journey,
                        consider buying the developer a coffee. ☕
                    </p>

                    <a
                        href="https://buymeacoffee.com/wealthpath"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem 2rem',
                            background: '#FFDD00',
                            color: '#000',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            textDecoration: 'none',
                            boxShadow: '0 4px 12px rgba(255, 221, 0, 0.3)',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        ☕ Buy Me a Coffee
                    </a>
                </div>
            </section>

            {/* Affiliates Section */}
            <section style={{
                padding: '3rem 1.5rem',
                background: 'rgba(241, 245, 249, 0.5)',
            }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    textAlign: 'center',
                }}>
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '1.5rem',
                    }}>
                        Platforms We Recommend
                    </h3>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        flexWrap: 'wrap',
                        marginBottom: '1.5rem',
                    }}>
                        <a
                            href="https://www.wealthsimple.com/invite"
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                textDecoration: 'none',
                                fontWeight: 600,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--nebula-purple)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                        >
                            Wealthsimple
                            <ExternalLink size={14} color="var(--text-secondary)" />
                        </a>

                        <a
                            href="https://www.questrade.com/self-directed-investing"
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                textDecoration: 'none',
                                fontWeight: 600,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--nebula-purple)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                        >
                            Questrade
                            <ExternalLink size={14} color="var(--text-secondary)" />
                        </a>
                    </div>

                    <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                    }}>
                        These are affiliate links. We may earn a small commission at no cost to you.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '2rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                textAlign: 'center',
            }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                }}>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem',
                        lineHeight: 1.6,
                    }}>
                        <strong>Disclaimer:</strong> WealthPath is for informational and educational purposes only.
                        It is not financial advice. Consult a qualified financial advisor before making investment decisions.
                    </p>

                    <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                    }}>
                        🔒 Your data never leaves your browser. 100% client-side. No cookies. No tracking.
                    </p>

                    <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                    }}>
                        © {new Date().getFullYear()} WealthPath. Made with ❤️ in Canada.
                    </p>
                </div>
            </footer>
        </div>
    );
}
