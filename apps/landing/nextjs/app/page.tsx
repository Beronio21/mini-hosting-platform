import Link from "next/link";

const features = [
    {
        title: "One-click container provisioning",
        description: "Spin up n8n, bot, or API containers with a controlled port, resource limits, and a public subdomain.",
    },
    {
        title: "JWT-backed control panel",
        description: "Users log in once and manage their own services from a simple dashboard built on Next.js.",
    },
    {
        title: "Caddy reverse proxy",
        description: "Each service gets automatic subdomain routing and HTTPS support through the proxy layer.",
    },
];

const pricing = [
    {
        name: "Starter",
        price: "$3",
        details: "1 service, basic limits, and self-serve launch flow.",
    },
    {
        name: "Growth",
        price: "$7",
        details: "Up to 5 services, better limits, and priority support.",
    },
    {
        name: "Scale",
        price: "$10",
        details: "For teams running multiple internal tools and production APIs.",
    },
];

const faq = [
    {
        question: "What can users deploy?",
        answer: "The first release supports n8n, bot, and API templates, with more templates added later.",
    },
    {
        question: "How are services isolated?",
        answer: "Each service runs in its own Docker container with per-service CPU and memory limits.",
    },
    {
        question: "How do subdomains work?",
        answer: "The backend assigns a port, stores the service, and registers a Caddy route for the subdomain.",
    },
];

export default function Page() {
    return (
        <main className="relative overflow-hidden bg-[#081018] text-white">
            <section className="relative isolate mx-auto max-w-7xl px-6 pb-24 pt-32 sm:pt-40 lg:px-8">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(70,95,255,0.28),_transparent_34%),radial-gradient(circle_at_70%_20%,_rgba(251,101,20,0.18),_transparent_22%)]" />
                <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                    <div>
                        <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">
                            Mini Hosting Platform
                        </div>
                        <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
                            Ship internal tools and APIs without managing servers by hand.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                            A lightweight hosting platform where your customers sign in, create a service, and get a containerized app with a public subdomain in minutes.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                href="/register"
                                className="rounded-2xl bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-400"
                            >
                                Get started
                            </Link>
                            <Link
                                href="/login"
                                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                            >
                                Sign in
                            </Link>
                        </div>

                        <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 text-sm text-slate-300">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="text-2xl font-semibold text-white">3</div>
                                <div className="mt-1">template types</div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="text-2xl font-semibold text-white">5</div>
                                <div className="mt-1">services per user</div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="text-2xl font-semibold text-white">1</div>
                                <div className="mt-1">dashboard to manage them</div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
                        <div className="rounded-3xl border border-white/10 bg-[#0c1423] p-6">
                            <div className="flex items-center justify-between text-sm text-slate-300">
                                <span>Provisioning flow</span>
                                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">Live</span>
                            </div>
                            <div className="mt-6 space-y-4 text-sm">
                                <Step title="1. Choose a template" description="n8n, bot, or API" />
                                <Step title="2. Assign subdomain" description="myapp.yourdomain.com" />
                                <Step title="3. Backend creates container" description="Port, memory, CPU, and proxy route" />
                                <Step title="4. Go live" description="Service appears in the dashboard immediately" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Features</p>
                    <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">The platform is focused on fast, repeatable deployments.</h2>
                </div>
                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {features.map((feature) => (
                        <article key={feature.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                            <h3 className="text-xl font-semibold">{feature.title}</h3>
                            <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">Pricing</p>
                    <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Simple per-service pricing for users.</h2>
                </div>
                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                    {pricing.map((plan) => (
                        <article key={plan.name} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">{plan.name}</p>
                            <div className="mt-4 text-4xl font-semibold">{plan.price}<span className="text-base font-medium text-slate-400">/mo</span></div>
                            <p className="mt-4 text-sm leading-7 text-slate-300">{plan.details}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section id="faq" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">FAQ</p>
                    <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Common questions about the hosting flow.</h2>
                </div>
                <div className="mt-10 grid gap-4">
                    {faq.map((item) => (
                        <details key={item.question} className="group rounded-[24px] border border-white/10 bg-white/5 p-6">
                            <summary className="cursor-pointer list-none text-lg font-semibold">{item.question}</summary>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{item.answer}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section id="contact" className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:px-8">
                <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,_rgba(70,95,255,0.18),_rgba(251,101,20,0.14))] p-8 sm:p-10">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Ready to launch</p>
                        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Start with the dashboard, then add billing and logs later.</h2>
                        <p className="mt-4 text-sm leading-7 text-slate-200">
                            The backend, proxy, and dashboard are already scaffolded. Next step is connecting the remaining landing copy, billing, and service observability flows.
                        </p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link href="/register" className="rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                            Create an account
                        </Link>
                        <Link href="/login" className="rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
                            Sign in
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

function Step({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">{title}</div>
            <div className="mt-1 text-sm text-slate-400">{description}</div>
        </div>
    );
}