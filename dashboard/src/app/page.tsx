"use client";

import Link from "next/link";
import Image from "next/image";
import { TextAnimate } from "@/components/ui/text-animate";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#F9F9FC' }}>
      {/* Noise Effect */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.015] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle Background Pattern */}
      <DotPattern
        className={cn(
          "absolute inset-0 z-0 opacity-20",
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
        )}
        width={24}
        height={24}
        cr={1}
      />

      {/* Navigation */}
      <BlurFade delay={0.1}>
        <nav className="relative z-50 w-full px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="Pomfret Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                Pomfret
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                href="/auth/login"
                className="transition-colors"
                style={{ color: '#777777' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#1A1A1A'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#777777'}
              >
                Sign In
              </Link>
              <Link href="/auth/signup">
                <ShimmerButton 
                  className="px-6 py-2 text-sm text-white border-0"
                  background="#A020F0"
                  shimmerColor="#FFFFFF"
                >
                  Get Started
                </ShimmerButton>
              </Link>
            </div>
          </div>
        </nav>
      </BlurFade>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <BlurFade delay={0.2}>
          <div className="flex items-center justify-center mb-8">
            <div 
              className="rounded-full backdrop-blur-sm px-4 py-2 flex items-center space-x-2"
              style={{ 
                backgroundColor: 'rgba(160, 32, 240, 0.1)', 
                border: '1px solid #E0E0E0' 
              }}
            >
              <div className="flex items-center space-x-1">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: '#4CAF50' }}
                />
                <AnimatedShinyText 
                  className="text-sm"
                  style={{ color: '#777777' }}
                >
                  ✨ Organize conversations from any AI model
                </AnimatedShinyText>
              </div>
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.3}>
          <TextAnimate
            animation="blurInUp"
            by="word"
            className="text-5xl md:text-7xl font-bold mb-6 max-w-4xl"
            style={{ color: '#1A1A1A' }}
          >
            Your AI Chat Library, Unified
          </TextAnimate>
        </BlurFade>

        <BlurFade delay={0.4}>
          <p 
            className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#777777' }}
          >
            Store, organize, and search through your conversations from ChatGPT, Claude, Gemini, and any AI model. 
            Never lose an important chat again with Pomfret&apos;s intelligent organization.
          </p>
        </BlurFade>

        <BlurFade delay={0.5}>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link href="/auth/signup">
              <ShimmerButton 
                className="px-8 py-4 text-lg font-medium text-white border-0"
                background="#A020F0"
                shimmerColor="#FFFFFF"
              >
                Start Organizing Free
              </ShimmerButton>
            </Link>
            <Link 
              href="/dashboard"
              className="px-8 py-4 text-lg font-medium transition-colors flex items-center space-x-2 group"
              style={{ color: '#777777' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#1A1A1A'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#777777'}
            >
              <span>View Demo</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </BlurFade>
      </section>
    </div>
  );
}