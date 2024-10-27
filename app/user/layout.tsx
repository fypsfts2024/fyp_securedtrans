export default function Layout({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-20 max-w-5xl px-3 w-full mt-10">
        {children}
    </div>;
}
