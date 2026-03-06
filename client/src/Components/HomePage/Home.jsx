import React from 'react'
import Form from './Form'

const Home = () => {
    return (
        <>
            <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden dot-grid bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
                <main className="flex-1 flex flex-col justify-center items-center">
                    {/* Hero Section */}
                    <section className="w-full max-w-5xl px-6 pt-24 pb-10 text-center">
                        {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">v2.0 is now live</span>
                        </div> */}
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-3">Code-Sync</h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-normal max-w-2xl mx-auto">
                            Collaborative web text-editor.
                        </p>
                    </section>

                    {/* Interaction Section */}
                    <section className="w-full max-w-3xl px-6 py-4">
                        <Form />
                    </section>
                </main>

                {/* Footer */}
                <footer className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
                        <span>© 2026 Code Sync Inc.</span>
                    </div>
                </footer>
            </div>
        </>
    )
}

export default Home