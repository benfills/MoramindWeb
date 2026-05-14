export default function Congrats() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center px-5 py-6"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200')",
      }}
    >
      <div className="rounded-2xl bg-white/90 px-8 py-10 text-center shadow-xl backdrop-blur">
        <p className="text-2xl font-bold text-gray-800">
          🎉 Hurray, you made it!
        </p>
      </div>
    </div>
  );
}
