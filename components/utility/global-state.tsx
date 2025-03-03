// TODO: Separate into multiple contexts, keeping simple for now

"use client"

import { ChatbotUIContext } from "@/context/context"
import { getProfileByUserId } from "@/db/profile"
import { getWorkspaceImageFromStorage } from "@/db/storage/workspace-images"
import { getWorkspacesByUserId } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { supabase } from "@/lib/supabase/browser-client"
import { Tables } from "@/supabase/types"
import {
  ChatFile,
  ChatMessage,
  ChatSettings,
  LLM,
  MessageImage,
  OpenRouterLLM,
  WorkspaceImage,
  LLMID
} from "@/types"
import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState, useMemo } from "react"

interface GlobalStateProps {
  children: React.ReactNode
}

export const GlobalState: FC<GlobalStateProps> = ({ children }) => {
  const router = useRouter()

  // PROFILE STORE
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null)

  // ITEMS STORE
  const [collections, setCollections] = useState<Tables<"collections">[]>([])
  const [chats, setChats] = useState<Tables<"chats">[]>([])
  const [files, setFiles] = useState<Tables<"files">[]>([])
  const [folders, setFolders] = useState<Tables<"folders">[]>([])
  const [workspaces, setWorkspaces] = useState<Tables<"workspaces">[]>([])

  // MODELS STORE
  const [envKeyMap, setEnvKeyMap] = useState<Record<string, VALID_ENV_KEYS>>({})

  // WORKSPACE STORE
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<Tables<"workspaces"> | null>(null)
  const [workspaceImages, setWorkspaceImages] = useState<WorkspaceImage[]>([])

  // ASSISTANT STORE
  const [openaiAssistants, setOpenaiAssistants] = useState<any[]>([])

  // PASSIVE CHAT STORE
  const [userInput, setUserInput] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    model: (process.env.LLM_TO_USE || "gpt-4-turbo-preview") as LLMID,
    prompt:
      process.env.SYSTEM_PROMPT ||
      "You are a genius legal assistant to a lawyer. You will analyze documents given to you, and from those documents, produce tailored answers to the questions provided. Additionally, add a hierarchy of points, where, the first  responses produced are extremely relevant, in-depth, and crucial to answer the question. These responses cannot be obvious as the lawyer will know generic strategies. You have to look at these documents to ensure that only information which would take a significant amount of time to gather is being presented. Only produce results that can meet the previous requirements and then cut it off. Still produce the results in bulleted format in order to make it clear to the user.  The remaining responses after 5 or so must be unorthodox suggestions  in order offer another prospective to answering the question. These answers must still use the documents and be very relevant, but the suggestions which you give must be unorthodox, as even though in the first round of the responses you give logical advise, not all lawyers will use it.  However, for all of these answers, you must be definitive, if information is in the documents, use that to answer the question. The responses you give cannot be generalized and must be very specific to answer the users needs. Again, emphasize the arguments can not be generalized. The use of if any evidence were to exist or any variant of such phrasing must be removed as the user is expecting you to be precise. Additionally, when suggesting strategy for how to address a case/question, be very specific and utilize all information to develop amazing case strategy which will help avoid all dangerous points. Additionally, whenever you make a suggestion, always include examples from evidence.",
    temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || "0.5"),
    contextLength: parseInt(process.env.DEFAULT_CONTEXT_LENGTH || "4000", 10),
    includeProfileContext: process.env.INCLUDE_PROFILE_CONTEXT === "true",
    includeWorkspaceInstructions:
      process.env.INCLUDE_WORKSPACE_INSTRUCTIONS === "true",
    embeddingsProvider:
      (process.env.EMBEDDINGS_PROVIDER as "openai" | "local") || "openai"
  })
  const [selectedChat, setSelectedChat] = useState<Tables<"chats"> | null>(null)
  const [chatFileItems, setChatFileItems] = useState<Tables<"file_items">[]>([])

  // ACTIVE CHAT STORE
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [firstTokenReceived, setFirstTokenReceived] = useState<boolean>(false)
  const [abortController, setAbortController] =
    useState<AbortController | null>(null)

  // CHAT INPUT COMMAND STORE
  const [isAtPickerOpen, setIsAtPickerOpen] = useState(false)
  const [atCommand, setAtCommand] = useState("")
  const [focusPrompt, setFocusPrompt] = useState(false)
  const [focusFile, setFocusFile] = useState(false)

  // ATTACHMENTS STORE
  const [chatFiles, setChatFiles] = useState<ChatFile[]>([])
  const [chatImages, setChatImages] = useState<MessageImage[]>([])
  const [newMessageFiles, setNewMessageFiles] = useState<ChatFile[]>([])
  const [newMessageImages, setNewMessageImages] = useState<MessageImage[]>([])
  const [showFilesDisplay, setShowFilesDisplay] = useState<boolean>(false)

  // RETIEVAL STORE
  const [useRetrieval, setUseRetrieval] = useState<boolean>(true)
  const [sourceCount, setSourceCount] = useState<number>(4)

  useEffect(() => {
    // Define fetchStartingData as a standalone function
    const fetchStartingData = async () => {
      const session = (await supabase.auth.getSession()).data.session

      if (session) {
        const user = session.user

        const profile = await getProfileByUserId(user.id)
        setProfile(profile)

        if (!profile.has_onboarded) {
          return router.push("/setup")
        }

        const workspaces = await getWorkspacesByUserId(user.id)
        setWorkspaces(workspaces)

        for (const workspace of workspaces) {
          let workspaceImageUrl = ""

          if (workspace.image_path) {
            workspaceImageUrl =
              (await getWorkspaceImageFromStorage(workspace.image_path)) || ""
          }

          if (workspaceImageUrl) {
            const response = await fetch(workspaceImageUrl)
            const blob = await response.blob()
            const base64 = await convertBlobToBase64(blob)

            setWorkspaceImages(prev => [
              ...prev,
              {
                workspaceId: workspace.id,
                path: workspace.image_path,
                base64: base64,
                url: workspaceImageUrl
              }
            ])
          }
        }

        return profile
      }
    }

    ;(async () => {
      const profile = await fetchStartingData()
    })()
  }, [router]) // Removed fetchStartingData from the dependency array

  return (
    <ChatbotUIContext.Provider
      value={{
        // PROFILE STORE
        profile,
        setProfile,

        // ITEMS STORE
        collections,
        setCollections,
        chats,
        setChats,
        files,
        setFiles,
        folders,
        setFolders,
        workspaces,
        setWorkspaces,

        // WORKSPACE STORE
        selectedWorkspace,
        setSelectedWorkspace,
        workspaceImages,
        setWorkspaceImages,

        // ASSISTANT STORE
        openaiAssistants,
        setOpenaiAssistants,

        // PASSIVE CHAT STORE
        userInput,
        setUserInput,
        chatMessages,
        setChatMessages,
        chatSettings,
        setChatSettings,
        selectedChat,
        setSelectedChat,
        chatFileItems,
        setChatFileItems,

        // ACTIVE CHAT STORE
        isGenerating,
        setIsGenerating,
        firstTokenReceived,
        setFirstTokenReceived,
        abortController,
        setAbortController,

        // CHAT INPUT COMMAND STORE
        isAtPickerOpen,
        setIsAtPickerOpen,
        atCommand,
        setAtCommand,
        focusPrompt,
        setFocusPrompt,
        focusFile,
        setFocusFile,

        // ATTACHMENT STORE
        chatFiles,
        setChatFiles,
        chatImages,
        setChatImages,
        newMessageFiles,
        setNewMessageFiles,
        newMessageImages,
        setNewMessageImages,
        showFilesDisplay,
        setShowFilesDisplay,

        // RETRIEVAL STORE
        useRetrieval,
        setUseRetrieval,
        sourceCount,
        setSourceCount
      }}
    >
      {children}
    </ChatbotUIContext.Provider>
  )
}
