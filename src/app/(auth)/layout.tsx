import AuroraBlur from "@/components/react-bits/aurora-blur";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-svh items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 hidden dark:block">
        <AuroraBlur
          speed={0.8}
          layers={[
            { color: "#6C3AED", speed: 0.25, intensity: 0.5 },
            { color: "#4f46e5", speed: 0.15, intensity: 0.4 },
            { color: "#80caff", speed: 0.1, intensity: 0.2 },
            { color: "#B19EEF", speed: 0.08, intensity: 0.15 },
          ]}
          skyLayers={[
            { color: "#120824", blend: 0.6 },
            { color: "#0a1020", blend: 0.4 },
          ]}
          opacity={0.5}
          brightness={0.5}
          saturation={1.3}
          noiseScale={2.5}
          movementX={-1}
          movementY={-1.5}
          verticalFade={0.5}
          bloomIntensity={2}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10 block dark:hidden"
        aria-hidden="true"
      >
        <div className="from-primary/8 via-primary/4 absolute inset-0 bg-linear-to-br to-[#80caff]/6" />
        <div className="bg-primary/6 absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
      </div>

      {children}
    </div>
  );
}
