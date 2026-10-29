import { ForgotForm } from "@/components/forms"

export const metadata = { title: "Forgot password" }

export default function Page() {
  return (
    <div className="wrap max-w-md py-16">
      <p className="kicker">Account</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">Forgot password</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Password reset email is not connected in this beta. The form always gives the same reply, so it does not reveal whether an email is registered.
      </p>
      <div className="mt-8">
        <ForgotForm />
      </div>
    </div>
  )
}
