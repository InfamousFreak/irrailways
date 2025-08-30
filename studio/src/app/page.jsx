// I've removed the import for "next/link" as it was causing an error.
// We will use standard anchor tags for links.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, UserCheck, Download } from "lucide-react";
// I've also removed the 'InteractiveHoverButton' component to resolve the error
// and will use the standard Button component for consistency.

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary mb-2">
          Indian Railways
        </h1>
        <p className="text-xl text-muted-foreground">
          Cable Management System
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8">
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
        <DownloadCard
          title="Download App"
          description="Access the Cable Management System on the go with our official Android app."
          icon={<Download className="w-12 h-12 text-primary" />}
          // UPDATED: Added the correct direct link for your APK file
          href="https://logicboots.com/RailRouteApp.apk"
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
      <CardContent className="flex flex-col flex-grow justify-between w-full">
        <p className="text-muted-foreground mb-6 flex-grow">{description}</p>
        {/* Using standard anchor tag instead of next/link */}
        <a href={href} className="w-full">
            <Button size="lg" className="w-full">Login as {role}</Button>
        </a>
      </CardContent>
    </Card>
  );
}

function DownloadCard({ title, description, icon, href }) {
    return (
      <Card className="text-center flex flex-col items-center justify-between p-6 hover:shadow-xl transition-shadow duration-300 w-full max-w-sm">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full mb-4">{icon}</div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow justify-between w-full">
          <p className="text-muted-foreground mb-6 flex-grow">{description}</p>
          <a
            href={href}
            download
            className="w-full"
          >
            {/* Standard button for APK download */}
            <Button size="lg" className="w-full">
                Download APK
            </Button>
          </a>
        </CardContent>
      </Card>
    );
}