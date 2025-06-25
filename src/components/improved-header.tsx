"use client"

import { Bell, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ImprovedHeader() {
  return (
    <div className="bg-green-600 text-white p-4 mb-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Finanças</h1>
              <p className="text-green-100 text-sm">Controle total das suas finanças</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
              <div className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                  3
                </Badge>
              </div>
            </Button>

            <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
              <Settings className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
