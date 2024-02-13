"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { ChatbotUIContext } from "@/context/context"
import { getChatsByWorkspaceId } from "@/db/chats"
import { getCollectionWorkspacesByWorkspaceId } from "@/db/collections"
import { getFileWorkspacesByWorkspaceId } from "@/db/files"
import { getFoldersByWorkspaceId } from "@/db/folders"
import { getWorkspaceById } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { supabase } from "@/lib/supabase/browser-client"
import { LLMID } from "@/types"
import { useParams, useRouter } from "next/navigation"
import { ReactNode, useContext, useEffect, useState, useCallback } from "react"
import Loading from "../loading"

interface WorkspaceLayoutProps {
  children: ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const router = useRouter()

  const params = useParams()
  const workspaceId = params.workspaceid as string

  const {
    setChatSettings,
    setChats,
    setCollections,
    setFolders,
    setFiles,
    selectedWorkspace,
    setSelectedWorkspace,
    setSelectedChat,
    setChatMessages,
    setUserInput,
    setIsGenerating,
    setFirstTokenReceived,
    setChatFiles,
    setChatImages,
    setNewMessageFiles,
    setNewMessageImages,
    setShowFilesDisplay
  } = useContext(ChatbotUIContext)

  const [loading, setLoading] = useState(true)

  const fetchWorkspaceData = useCallback(
    async (workspaceId: string) => {
      setLoading(true)

      const workspace = await getWorkspaceById(workspaceId)
      setSelectedWorkspace(workspace)

      const chats = await getChatsByWorkspaceId(workspaceId)
      setChats(chats)

      const collectionData =
        await getCollectionWorkspacesByWorkspaceId(workspaceId)
      setCollections(collectionData.collections)

      const folders = await getFoldersByWorkspaceId(workspaceId)
      setFolders(folders)

      const fileData = await getFileWorkspacesByWorkspaceId(workspaceId)
      setFiles(fileData.files)
      setChatSettings({
        model: (process.env.LLM_TO_USE || "gpt-4-turbo-preview") as LLMID,
        prompt:
          process.env.SYSTEM_PROMPT ||
          "You are a genius legal assistant to a lawyer. You will analyze documents given to you, and from those documents, produce tailored answers to the questions provided. Additionally, add a hierarchy of points, where, the first  responses produced are extremely relevant, in-depth, and crucial to answer the question. These responses cannot be obvious as the lawyer will know generic strategies. You have to look at these documents to ensure that only information which would take a significant amount of time to gather is being presented. Only produce results that can meet the previous requirements and then cut it off. Still produce the results in bulleted format in order to make it clear to the user.  The remaining responses after 5 or so must be unorthodox suggestions  in order offer another prospective to answering the question. These answers must still use the documents and be very relevant, but the suggestions which you give must be unorthodox, as even though in the first round of the responses you give logical advise, not all lawyers will use it.  However, for all of these answers, you must be definitive, if information is in the documents, use that to answer the question. The responses you give cannot be generalized and must be very specific to answer the users needs. Again, emphasize the arguments can not be generalized. The use of if any evidence were to exist or any variant of such phrasing must be removed as the user is expecting you to be precise. Additionally, when suggesting strategy for how to address a case/question, be very specific and utilize all information to develop amazing case strategy which will help avoid all dangerous points. Additionally, whenever you make a suggestion, always include examples from evidence.",
        temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || "0.5"),
        contextLength: parseInt(
          process.env.DEFAULT_CONTEXT_LENGTH || "4096",
          10
        ),
        includeProfileContext: process.env.INCLUDE_PROFILE_CONTEXT === "true",
        includeWorkspaceInstructions:
          process.env.INCLUDE_WORKSPACE_INSTRUCTIONS === "true",
        embeddingsProvider:
          (process.env.EMBEDDINGS_PROVIDER as "openai" | "local") || "openai"
      })

      setLoading(false)
    },
    [
      setChatSettings,
      setChats,
      setCollections,
      setFiles,
      setFolders,
      setSelectedWorkspace
    ]
  )

  useEffect(() => {
    ;(async () => {
      const session = (await supabase.auth.getSession()).data.session

      if (!session) {
        return router.push("/login")
      } else {
        await fetchWorkspaceData(workspaceId)
      }
    })()
  }, [router, workspaceId, fetchWorkspaceData])

  useEffect(() => {
    ;(async () => await fetchWorkspaceData(workspaceId))()

    setUserInput("")
    setChatMessages([])
    setSelectedChat(null)

    setIsGenerating(false)
    setFirstTokenReceived(false)

    setChatFiles([])
    setChatImages([])
    setNewMessageFiles([])
    setNewMessageImages([])
    setShowFilesDisplay(false)
  }, [
    workspaceId,
    fetchWorkspaceData,
    setUserInput,
    setChatMessages,
    setSelectedChat,
    setIsGenerating,
    setFirstTokenReceived,
    setChatFiles,
    setChatImages,
    setNewMessageFiles,
    setNewMessageImages,
    setShowFilesDisplay
  ])

  if (loading) {
    return <Loading />
  }

  return <Dashboard>{children}</Dashboard>
}
