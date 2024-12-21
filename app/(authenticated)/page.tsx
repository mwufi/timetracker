'use client'

import { useState, useEffect } from 'react'
import { ActiveSession } from '@/components/active-session'
import { ProjectList } from '@/components/project-list'
import { NewSessionDialog } from '@/components/new-session-dialog'
import { EditSessionDialog } from '@/components/edit-session-dialog'
import { SignInDialog } from '@/components/sign-in-dialog'
import { ContributionsGrid } from '@/components/contributions-grid'
import { DaySessionsTabs } from '@/components/day-sessions-tabs'
import { FeedbackButton } from '@/components/feedback-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createClient } from '@/utils/supabase/client'
import { createBackend } from '@/lib/backend'
import type { Project, WorkSession, User } from '@/lib/types'
