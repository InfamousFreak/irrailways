'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react";

const queueItems = [
  { id: "AS-00123", location: "Mile 42, West Corridor", officer: "John Doe", date: "2023-10-26", status: "Pending Verification", photos: [1, 2, 3] },
  { id: "AS-00124", location: "Junction B, North Line", officer: "Mary Johnson", date: "2023-10-25", status: "Pending Verification", photos: [4, 5, 6] },
];

export default function VerificationQueuePage() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Verification Queue</h1>
        <p className="text-muted-foreground">Review and approve or reject asset installations.</p>
      </div>
      <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {queueItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-bold">{item.id}</CardTitle>
                  <Badge style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>{item.status}</Badge>
                </div>
                <CardDescription>{item.location}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Details</h3>
                  <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                      <span>Submitted by:</span><span className="font-medium text-foreground">{item.officer}</span>
                      <span>Submission Date:</span><span className="font-medium text-foreground">{item.date}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Submitted Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {item.photos.map(i => (
                       <DialogTrigger asChild key={i}>
                        <Image
                          src="https://placehold.co/400x300.png"
                          alt={`Photo ${i} for asset ${item.id}`}
                          data-ai-hint="cable infrastructure"
                          width={400}
                          height={300}
                          className="rounded-lg object-cover aspect-video cursor-pointer"
                          onClick={() => setSelectedImage("https://placehold.co/800x600.png")}
                        />
                      </DialogTrigger>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="destructive">Reject</Button>
                <Button>Approve</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {selectedImage && (
            <DialogContent className="max-w-3xl">
                <Image
                    src={selectedImage}
                    alt="Enlarged asset photo"
                    data-ai-hint="cable infrastructure"
                    width={800}
                    height={600}
                    className="rounded-lg object-contain w-full h-full"
                />
            </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
