export default async function Index() {
    return (
        <>
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
                <img
                    src="/STMainpage.png"
                    alt=""
                    className="w-full lg:w-[70%] lg:min-h-screen object-cover"
                />
                <div className="w-full lg:w-[30%] lg:px-0 px-10 italic uppercase">
                    <h1
                        className="text-3xl lg:text-5xl !leading-tight text-left mb-2 font-bold"
                    >
                        Your <span className="text-[#b1d4eb]">files</span>
                        <br />
                        your <span className="text-[#edeb99]">control</span>
                    </h1>
                    <p className="lg:pe-32">
                        Empower your data with SecuredTrans. <br />
                        We protect your files, encrypt sensitive information,
                        and ensure secure delivery. Take charge of your privacy{" "}
                        <br />
                        <br />
                        —your files deserve the best.
                    </p>
                </div>
            </div>
        </>
    );
}
