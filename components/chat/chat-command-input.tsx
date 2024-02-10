import { ChatbotUIContext } from "@/context/context"
import { FC, useContext } from "react"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { FilePicker } from "./file-picker"

interface ChatCommandInputProps {}

export const ChatCommandInput: FC<ChatCommandInputProps> = ({}) => {
  const {
    newMessageFiles,
    chatFiles,
    isAtPickerOpen,
    setIsAtPickerOpen,
    atCommand,
    focusPrompt,
    focusFile
  } = useContext(ChatbotUIContext)

  const { handleSelectUserFile, handleSelectUserCollection } =
    usePromptAndCommand()

  return (
    <>
      <FilePicker
        isOpen={isAtPickerOpen}
        searchQuery={atCommand}
        onOpenChange={setIsAtPickerOpen}
        selectedFileIds={[...newMessageFiles, ...chatFiles].map(
          file => file.id
        )}
        selectedCollectionIds={[]}
        onSelectFile={handleSelectUserFile}
        onSelectCollection={handleSelectUserCollection}
        isFocused={focusFile}
      />
    </>
  )
}
