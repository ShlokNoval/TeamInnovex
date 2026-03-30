"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HazardIcon } from "@/components/shared/hazard-icon"
import { HazardType } from "@/lib/types"

interface FeatureCardProps {
  title: string
  description: string
  type: HazardType
}

export function FeatureCard({ title, description, type }: FeatureCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
          <HazardIcon type={type} className="text-primary w-6 h-6" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base text-muted-foreground">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
