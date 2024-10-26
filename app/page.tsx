import Image from "next/image";
export default async function Index() {
    return (
        <>
            <div className="flex flex-col gap-16 items-center min-h-screen justify-center">
                <Image
                    src="/hero-2.png"
                    alt="Logo"
                    width={300}
                    height={300}
                />
                {/* <Image
                    src="/hero.png"
                    alt="Logo"
                    width={300}
                    height={300}
                /> */}
                <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
                    Your files, your control.
                </p>
                <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
            </div>
        </>
    );
}
