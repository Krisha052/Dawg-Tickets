import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: theSession, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!theSession) return <p>You must log in</p>;

  return (
    <div>
      <h1>Welcome {theSession.user.theName}</h1>
      <p>Your ID: {theSession.user.theId}</p>
      <p>API Token: {theSession.user.theApiAccessToken}</p>
    </div>
  );
}
