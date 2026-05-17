import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, FileText} from "lucide-react";
import { signOut } from "@/auth";
import Image from "next/image";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div className="flex min-h-dvh">
      
      <aside className="w-60 shrink-0 max-sm:hidden border-r border-gray-200 flex flex-col p-6">
       <Link href={"/dashboard"} className="py-8">
        <Image src={"/log1.png"} alt="logo1" height={180} width={180}  className="bg-white"/>
       </Link>

        <nav className="space-y-1 flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/dashboard/invoices" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
            <FileText className="w-4 h-4" />
            Invoices
          </Link>
          <Link href="/dashboard/clients" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
            <Users className="w-4 h-4" />
            Clients
          </Link>
        </nav>

        
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-3">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{session.user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
            </div>
          </div>

          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}>
            <button type="submit" className="w-full text-left text-xs text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <aside className=" shrink-0 sm:hidden border-r border-gray-200 flex flex-col py-6 px-2">
       <Link href={"/dashboard"} className="py-8">
        <Image src={"/log2.png"} alt="logo1" height={40} width={40}  className="bg-white"/>
       </Link>

        <nav className="space-y-1 flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
            <LayoutDashboard className="w-4 h-4" />
          </Link>
          <Link href="/dashboard/invoices" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
            <FileText className="w-4 h-4" />
          </Link>
          <Link href="/dashboard/clients" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
            <Users className="w-4 h-4" />
          </Link>
        </nav>


        <div className="flex flex-col items-center gap-3 border-t pt-4">
    {session.user?.image && (
      <Image
        src={session.user.image}
        alt="avatar"
        width={32}
        height={32}
        className="rounded-full"
      />
    )}
    <form action={async () => {
      "use server";
      await signOut({ redirectTo: "/" });
    }}>
      <button type="submit" className="text-xs text-gray-500 hover:text-gray-900">
        Out
      </button>
    </form>
  </div>

        
      
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}