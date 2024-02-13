"use client"

import { ChatbotUIContext } from "@/context/context"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { ChatSettings } from "@/types"
import { IconInfoCircle } from "@tabler/icons-react"
import { FC, useContext } from "react"
import { AdvancedSettings } from "./advanced-settings"
import { Checkbox } from "./checkbox"
import { Label } from "./label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./select"
import { Slider } from "./slider"
import { TextareaAutosize } from "./textarea-autosize"
import { WithTooltip } from "./with-tooltip"

interface ChatSettingsFormProps {
  chatSettings: ChatSettings
  onChangeChatSettings: (value: ChatSettings) => void
  useAdvancedDropdown?: boolean
  showTooltip?: boolean
}

export const ChatSettingsForm: FC<ChatSettingsFormProps> = ({
  chatSettings,
  onChangeChatSettings,
  useAdvancedDropdown = true,
  showTooltip = true
}) => {
  const { profile } = useContext(ChatbotUIContext)

  if (!profile) return null

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Prompt</Label>

        <TextareaAutosize
          className="bg-background border-input border-2"
          placeholder="You are a genius legal assistant to a lawyer. You will analyze documents given to you, and from those documents, produce tailored answers to the questions provided. Additionally, add a hierarchy of points, where, the first  responses produced are extremely relevant, in-depth, and crucial to answer the question. These responses cannot be obvious as the lawyer will know generic strategies. You have to look at these documents to ensure that only information which would take a significant amount of time to gather is being presented. Only produce results that can meet the previous requirements and then cut it off. Still produce the results in bulleted format in order to make it clear to the user.  The remaining responses after 5 or so must be unorthodox suggestions  in order offer another prospective to answering the question. These answers must still use the documents and be very relevant, but the suggestions which you give must be unorthodox, as even though in the first round of the responses you give logical advise, not all lawyers will use it.  However, for all of these answers, you must be definitive, if information is in the documents, use that to answer the question. The responses you give cannot be generalized and must be very specific to answer the users needs. Again, emphasize the arguments can not be generalized. The use of if any evidence were to exist or any variant of such phrasing must be removed as the user is expecting you to be precise. Additionally, when suggesting strategy for how to address a case/question, be very specific and utilize all information to develop amazing case strategy which will help avoid all dangerous points. Additionally, whenever you make a suggestion, always include examples from evidence."
          onValueChange={prompt => {
            onChangeChatSettings({ ...chatSettings, prompt })
          }}
          value={chatSettings.prompt}
          minRows={3}
          maxRows={6}
        />
      </div>

      {useAdvancedDropdown ? (
        <AdvancedSettings>
          <AdvancedContent
            chatSettings={chatSettings}
            onChangeChatSettings={onChangeChatSettings}
            showTooltip={showTooltip}
          />
        </AdvancedSettings>
      ) : (
        <div>
          <AdvancedContent
            chatSettings={chatSettings}
            onChangeChatSettings={onChangeChatSettings}
            showTooltip={showTooltip}
          />
        </div>
      )}
    </div>
  )
}

interface AdvancedContentProps {
  chatSettings: ChatSettings
  onChangeChatSettings: (value: ChatSettings) => void
  showTooltip: boolean
}

const AdvancedContent: FC<AdvancedContentProps> = ({
  chatSettings,
  onChangeChatSettings,
  showTooltip
}) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)

  const MODEL_LIMITS = CHAT_SETTING_LIMITS[chatSettings.model] || {
    MIN_TEMPERATURE: 0,
    MAX_TEMPERATURE: 1,
    MAX_CONTEXT_LENGTH: 4096
  }

  return (
    <div className="mt-5">
      <div className="space-y-3">
        <Label className="flex items-center space-x-1">
          <div>Temperature:</div>

          <div>{chatSettings.temperature}</div>
        </Label>

        <Slider
          value={[chatSettings.temperature]}
          onValueChange={temperature => {
            onChangeChatSettings({
              ...chatSettings,
              temperature: temperature[0]
            })
          }}
          min={MODEL_LIMITS.MIN_TEMPERATURE}
          max={MODEL_LIMITS.MAX_TEMPERATURE}
          step={0.01}
        />
      </div>

      <div className="mt-6 space-y-3">
        <Label className="flex items-center space-x-1">
          <div>Context Length:</div>

          <div>{chatSettings.contextLength}</div>
        </Label>

        <Slider
          value={[chatSettings.contextLength]}
          onValueChange={contextLength => {
            onChangeChatSettings({
              ...chatSettings,
              contextLength: contextLength[0]
            })
          }}
          min={0}
          max={MODEL_LIMITS.MAX_CONTEXT_LENGTH - 200} // 200 is a minimum buffer for token output
          step={1}
        />
      </div>

      <div className="mt-7 flex items-center space-x-2">
        <Checkbox
          checked={chatSettings.includeProfileContext}
          onCheckedChange={(value: boolean) =>
            onChangeChatSettings({
              ...chatSettings,
              includeProfileContext: value
            })
          }
        />

        <Label>Chats Include Profile Context</Label>

        {showTooltip && (
          <WithTooltip
            delayDuration={0}
            display={
              <div className="w-[400px] p-3">
                {profile?.profile_context || "No profile context."}
              </div>
            }
            trigger={
              <IconInfoCircle className="cursor-hover:opacity-50" size={16} />
            }
          />
        )}
      </div>

      <div className="mt-4 flex items-center space-x-2">
        <Checkbox
          checked={chatSettings.includeWorkspaceInstructions}
          onCheckedChange={(value: boolean) =>
            onChangeChatSettings({
              ...chatSettings,
              includeWorkspaceInstructions: value
            })
          }
        />

        <Label>Chats Include Workspace Instructions</Label>

        {showTooltip && (
          <WithTooltip
            delayDuration={0}
            display={
              <div className="w-[400px] p-3">
                {selectedWorkspace?.instructions ||
                  "No workspace instructions."}
              </div>
            }
            trigger={
              <IconInfoCircle className="cursor-hover:opacity-50" size={16} />
            }
          />
        )}
      </div>

      <div className="mt-5">
        <Label>Embeddings Provider</Label>

        <Select
          value={chatSettings.embeddingsProvider}
          onValueChange={(embeddingsProvider: "openai" | "local") => {
            onChangeChatSettings({
              ...chatSettings,
              embeddingsProvider
            })
          }}
        >
          <SelectTrigger>
            <SelectValue defaultValue="openai" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="openai">
              {profile?.use_azure_openai ? "Azure OpenAI" : "OpenAI"}
            </SelectItem>

            {window.location.hostname === "localhost" && (
              <SelectItem value="local">Local</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
