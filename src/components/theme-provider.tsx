"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { LanguageProvider } from "@/context/language-context"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </NextThemesProvider>
  )
}
