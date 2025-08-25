import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, UserCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary mb-2">
          Indian Railways
        </h1>
        <p className="text-xl text-muted-foreground">
          Indian Railways Cable Management System
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
        <RoleCard
          role="Admin"
          description="Manage users and system settings."
          icon={<Shield className="w-12 h-12 text-primary" />}
          href="/admin"
        />
        <RoleCard
          role="Supervisor"
          description="Verify and approve asset submissions."
          icon={<UserCheck className="w-12 h-12 text-primary" />}
          href="/supervisor"
        />
        <RoleCard
          role="Officer"
          description="View compliance and asset data."
          icon={<User className="w-12 h-12 text-primary" />}
          href="/officer"
        />
      </div>
    </div>
  );
}

function RoleCard({ role, description, icon, href }) {
  return (
    <Card className="text-center flex flex-col items-center justify-between p-6 hover:shadow-xl transition-shadow duration-300 w-full max-w-sm">
      <CardHeader>
        <div className="mx-auto bg-secondary p-4 rounded-full mb-4">{icon}</div>
        <CardTitle className="text-2xl font-bold">{role}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">{description}</p>
        <Button asChild size="lg" className="w-full">
          <Link href={href}>Login as {role}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
