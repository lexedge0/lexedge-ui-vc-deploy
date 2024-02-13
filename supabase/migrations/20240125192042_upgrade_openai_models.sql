-- WORKSPACES

UPDATE workspaces
SET default_model = 'gpt-4-turbo-preview'
WHERE default_model = 'gpt-4-1106-preview';

UPDATE workspaces
SET default_model = 'gpt-3.5-turbo'
WHERE default_model = 'gpt-3.5-turbo-1106';

-- CHATS

UPDATE chats
SET model = 'gpt-4-turbo-preview'
WHERE model = 'gpt-4-1106-preview';

UPDATE chats
SET model = 'gpt-3.5-turbo'
WHERE model = 'gpt-3.5-turbo-1106';

-- MESSAGES

UPDATE messages
SET model = 'gpt-4-turbo-preview'
WHERE model = 'gpt-4-1106-preview';

UPDATE messages
SET model = 'gpt-3.5-turbo'
WHERE model = 'gpt-3.5-turbo-1106';

-- PROFILES

CREATE OR REPLACE FUNCTION create_profile_and_workspace() 
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    random_username TEXT;
BEGIN
    -- Generate a random username
    random_username := 'user' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);

    -- Create a profile for the new user
    INSERT INTO public.profiles(user_id, anthropic_api_key, azure_openai_35_turbo_id, azure_openai_45_turbo_id, azure_openai_45_vision_id, azure_openai_api_key, azure_openai_endpoint, google_gemini_api_key, has_onboarded, image_url, image_path, mistral_api_key, display_name, bio, openai_api_key, openai_organization_id, perplexity_api_key, profile_context, use_azure_openai, username)
    VALUES(
        NEW.id,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        FALSE,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        FALSE,
        random_username
    );

    INSERT INTO public.workspaces(user_id, is_home, name, default_context_length, default_model, default_prompt, default_temperature, description, embeddings_provider, include_profile_context, include_workspace_instructions, instructions)
    VALUES(
        NEW.id,
        TRUE,
        'Home',
        4096,
        'gpt-4-turbo-preview', -- Updated default model
        'You are a genius legal assistant to a lawyer. You will analyze documents given to you, and from those documents, produce tailored answers to the questions provided. Additionally, add a hierarchy of points, where, the first  responses produced are extremely relevant, in-depth, and crucial to answer the question. These responses cannot be obvious as the lawyer will know generic strategies. You have to look at these documents to ensure that only information which would take a significant amount of time to gather is being presented. Only produce results that can meet the previous requirements and then cut it off. Still produce the results in bulleted format in order to make it clear to the user.  The remaining responses after 5 or so must be unorthodox suggestions  in order offer another prospective to answering the question. These answers must still use the documents and be very relevant, but the suggestions which you give must be unorthodox, as even though in the first round of the responses you give logical advise, not all lawyers will use it.  However, for all of these answers, you must be definitive, if information is in the documents, use that to answer the question. The responses you give cannot be generalized and must be very specific to answer the users needs. Again, emphasize the arguments can not be generalized. The use of if any evidence were to exist or any variant of such phrasing must be removed as the user is expecting you to be precise. Additionally, when suggesting strategy for how to address a case/question, be very specific and utilize all information to develop amazing case strategy which will help avoid all dangerous points. Additionally, whenever you make a suggestion, always include examples from evidence.',
        0.5,
        'My home workspace.',
        'openai',
        TRUE,
        TRUE,
        ''
    );

    RETURN NEW;
END;
$$;
