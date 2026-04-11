// app/login/page.tsx - SERVER COMPONENT
import LoginForm from '@/components/LoginForm'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string }
}) {
  const redirectTo = searchParams.redirectTo || '/members'
  return <LoginForm redirectTo={redirectTo} />
}