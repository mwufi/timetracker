import Image from "next/image";

export default function Home() {
    return (
        <main>
            <h1 className="text-3xl font-bold underline">Hello world!</h1>
            <Image
                src="/analog_interior_large.webp"
                alt="Analog Interior"
                width={400}
                height={400}
                className="object-cover"
            />
            <h1 className="text-3xl font-bold underline">Hello world!</h1>
        </main>
    );
}