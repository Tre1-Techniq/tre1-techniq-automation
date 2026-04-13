// app/login/page.tsx
import LoginForm from '@/components/LoginForm'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string }
}) {
  const redirectTo = searchParams.redirectTo || '/members'
  return <LoginForm redirectTo={redirectTo} />
}