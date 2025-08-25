import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const complianceData = [
  { section: "North Corridor", status: 95 },
  { section: "West Corridor", status: 82 },
  { section: "East Line", status: 75 },
  { section: "Central Junction", status: 100 },
];

export default function OfficerDashboard() {
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Section Compliance Status</CardTitle>
            <CardDescription>Overview of compliance levels across all sections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {complianceData.map(item => (
              <div key={item.section}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-base font-medium">{item.section}</span>
                  <span className="text-base font-bold text-primary">{item.status}%</span>
                </div>
                <Progress value={item.status} aria-label={`${item.section} compliance ${item.status}%`} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-3">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Cable GIS Map</CardTitle>
            <CardDescription>Visual overview of cable assets.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <Link href="/officer/map">
              <Image 
                src="https://placehold.co/800x600.png"
                width={800}
                height={600}
                alt="GIS Map Preview"
                data-ai-hint="gis map"
                className="rounded-lg object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
          </CardContent>
          <div className="p-6 pt-0 text-right">
             <Button asChild>
                <Link href="/officer/map">
                  View Full Map <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
              </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
