import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h1 className="text-xl font-semibold">Login</h1>
      <p className="text-zinc-300">Autentificare prin Discord OAuth2 (fără bot).</p>
      <form
        action={async () => {
          "use server";
          await signIn("discord", { redirectTo: "/dashboard" });
        }}
      >
        <button className="w-full rounded-xl bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500">
          Login cu Discord
        </button>
      </form>
    </div>
  );
}
