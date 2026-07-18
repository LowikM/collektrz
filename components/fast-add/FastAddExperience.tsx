"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import {
  submitFastAddCollectionItem,
  type CollectionDuplicateInfo,
} from "@/app/my-collection/add/actions";
import { AddCollectionDetails } from "@/components/fast-add/AddCollectionDetails";
import { CardCandidateList } from "@/components/fast-add/CardCandidateList";
import { CardConfirmation } from "@/components/fast-add/CardConfirmation";
import { CardImageUpload } from "@/components/fast-add/CardImageUpload";
import { DuplicateCardDialog } from "@/components/fast-add/DuplicateCardDialog";
import {
  FastAddBackLink,
  FastAddEntryMethods,
  type FastAddEntryMethod,
} from "@/components/fast-add/FastAddEntryMethods";
import { FastAddSuccess } from "@/components/fast-add/FastAddSuccess";
import { FastCardSearch } from "@/components/fast-add/FastCardSearch";
import { RecognitionProgress } from "@/components/fast-add/RecognitionProgress";
import { splitFallbackHints } from "@/lib/card-recognition/fallback-query";
import type { CardRecognitionResult } from "@/lib/card-recognition/types";
import { searchResultToSelectedCard } from "@/lib/card-recognition/types";
import { trackFastAddEvent } from "@/lib/fast-add-analytics";
import {
  getFastAddErrorCopy,
  mapRecognitionApiError,
} from "@/lib/fast-add-errors";
import type { PokemonTcgCardSearchResult } from "@/lib/pokemon-tcg";

type FastAddStep =
  | "entry"
  | "search"
  | "upload"
  | "camera"
  | "recognizing"
  | "candidates"
  | "confirm"
  | "details"
  | "duplicate"
  | "success";

type PreservedDefaults = {
  showOnProfile: boolean;
  condition: string;
};

type FastAddExperienceProps = {
  initialMethod?: FastAddEntryMethod;
};

function buildFormData(input: {
  card: PokemonTcgCardSearchResult;
  quantity: number;
  condition: string;
  notes: string;
  showOnProfile: boolean;
  duplicateAction: "check" | "increment" | "separate";
}) {
  const formData = new FormData();
  formData.set("item_kind", "card");
  formData.set("quantity", String(input.quantity));
  formData.set("card_name", input.card.name);
  formData.set("set_name", input.card.set.name);
  formData.set("tcg_api_card_id", input.card.id);
  formData.set("card_number", input.card.number);
  formData.set("set_id", input.card.set.id);
  formData.set("duplicate_action", input.duplicateAction);

  if (input.condition.trim()) {
    formData.set("condition", input.condition.trim());
  }

  if (input.notes.trim()) {
    formData.set("notes", input.notes.trim());
  }

  formData.set("visibility", input.showOnProfile ? "public" : "private");
  if (input.showOnProfile) {
    formData.set("is_featured", "false");
  }

  return formData;
}

export function FastAddExperience({ initialMethod }: FastAddExperienceProps) {
  const [step, setStep] = useState<FastAddStep>(initialMethod ? initialMethod : "entry");
  const [activeMethod, setActiveMethod] = useState<FastAddEntryMethod | null>(
    initialMethod ?? null,
  );
  const [selectedCard, setSelectedCard] = useState<PokemonTcgCardSearchResult | null>(
    null,
  );
  const [lastAddedCard, setLastAddedCard] = useState<PokemonTcgCardSearchResult | null>(
    null,
  );
  const [recognitionResult, setRecognitionResult] =
    useState<CardRecognitionResult | null>(null);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [searchSeed, setSearchSeed] = useState("");
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [showOnProfile, setShowOnProfile] = useState(false);
  const [preservedDefaults, setPreservedDefaults] = useState<PreservedDefaults>({
    showOnProfile: false,
    condition: "",
  });
  const [duplicateInfo, setDuplicateInfo] = useState<CollectionDuplicateInfo | null>(
    null,
  );
  const [successState, setSuccessState] = useState<{
    cardName: string;
    quantity: number;
    incremented: boolean;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const lastSubmissionFingerprint = useRef<string | null>(null);

  const usedRecognition = Boolean(
    recognitionResult &&
      (step === "confirm" || step === "candidates" || step === "details"),
  );

  useEffect(() => {
    trackFastAddEvent("fast_add_started");
  }, []);

  useEffect(() => {
    function handleGlobalKeys(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (
        step === "search" &&
        !isTyping &&
        (event.key === "/" || (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)))
      ) {
        event.preventDefault();
        document.getElementById("fast-card-search")?.focus();
      }

      if (event.key === "Escape") {
        if (step === "search" && referenceImageUrl) {
          setStep(activeMethod === "camera" ? "camera" : activeMethod === "upload" ? "upload" : "entry");
        } else if (step === "candidates" || step === "confirm") {
          openManualSearchFallback(recognitionResult);
        }
      }
    }

    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [activeMethod, recognitionResult, referenceImageUrl, step]);

  function openManualSearchFallback(result: CardRecognitionResult | null) {
    const hints = splitFallbackHints({
      extractedName: result?.extractedName,
      extractedNumber: result?.extractedNumber,
      extractedSetHint: result?.extractedSetHint,
    });
    setSearchSeed(hints.query);
    setRecognitionError(
      result?.message ??
        getFastAddErrorCopy("low_confidence").message,
    );
    setStep("search");
  }

  function resetFlow(options?: {
    method?: FastAddEntryMethod | null;
    focusSearch?: boolean;
    preserveDefaults?: boolean;
    keepReferenceImage?: boolean;
  }) {
    setSelectedCard(null);
    setRecognitionResult(null);
    setRecognitionError(null);
    setDuplicateInfo(null);
    setSuccessState(null);
    setSubmitError(null);
    setQuantity(1);
    setNotes("");

    if (options?.preserveDefaults) {
      setShowOnProfile(preservedDefaults.showOnProfile);
      setCondition(preservedDefaults.condition);
    } else {
      setShowOnProfile(false);
      setCondition("");
    }

    if (!options?.keepReferenceImage) {
      setReferenceImageUrl(null);
      setSearchSeed("");
    }

    lastSubmissionFingerprint.current = null;

    const method = options?.method ?? null;
    setActiveMethod(method);

    if (method === "search" || options?.focusSearch) {
      setStep("search");
      return;
    }

    if (method === "upload") {
      setStep("upload");
      return;
    }

    if (method === "camera") {
      setStep("camera");
      return;
    }

    setStep("entry");
  }

  function handleSelectMethod(method: FastAddEntryMethod) {
    setActiveMethod(method);
    setStep(method);
    trackFastAddEvent("search_used", { method });
  }

  function handleSelectCard(card: PokemonTcgCardSearchResult) {
    setSelectedCard(card);
    setStep("confirm");
  }

  async function recognizeImage(input: {
    file: File;
    previewUrl: string;
    clientHints: {
      rawText?: string;
      extractedName?: string;
      extractedNumber?: string;
      extractedSetHint?: string;
    } | null;
    width: number;
    height: number;
    fingerprint: string;
  }) {
    if (lastSubmissionFingerprint.current === input.fingerprint) {
      setRecognitionError(getFastAddErrorCopy("duplicate_submission").message);
      return;
    }

    setReferenceImageUrl(input.previewUrl);
    setStep("recognizing");
    setRecognitionError(null);

    try {
      const formData = new FormData();
      formData.set("image", input.file);
      formData.set("fingerprint", input.fingerprint);
      formData.set("imageWidth", String(input.width));
      formData.set("imageHeight", String(input.height));
      formData.set("ocrAttempted", input.clientHints?.rawText ? "1" : "0");

      if (input.clientHints?.rawText) {
        formData.set("rawText", input.clientHints.rawText);
      }

      if (input.clientHints?.extractedName) {
        formData.set("extractedName", input.clientHints.extractedName);
      }

      if (input.clientHints?.extractedNumber) {
        formData.set("extractedNumber", input.clientHints.extractedNumber);
      }

      if (input.clientHints?.extractedSetHint) {
        formData.set("extractedSetHint", input.clientHints.extractedSetHint);
      }

      lastSubmissionFingerprint.current = input.fingerprint;

      const response = await fetch("/api/card-recognize", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | { result?: CardRecognitionResult; error?: string; code?: string; action?: string }
        | null;

      if (!response.ok) {
        const copy = mapRecognitionApiError(payload?.code, payload?.error);
        throw new Error(copy.message);
      }

      const result = payload?.result;

      if (!result) {
        throw new Error(getFastAddErrorCopy("recognition_unavailable").message);
      }

      setRecognitionResult(result);

      if (result.confidenceLevel === "none" || result.candidates.length === 0) {
        openManualSearchFallback(result);
        trackFastAddEvent("recognition_failed", {
          reason: result.fallbackReason ?? "no_candidates",
        });
        return;
      }

      if (result.confidenceLevel === "low") {
        openManualSearchFallback(result);
        trackFastAddEvent("recognition_failed", { reason: "low_confidence" });
        return;
      }

      if (result.confidenceLevel === "high" && result.candidates[0]) {
        setSelectedCard(searchResultToSelectedCard(result.candidates[0]));
        setStep("confirm");
        trackFastAddEvent("recognition_succeeded", {
          confidenceLevel: result.confidenceLevel,
        });
        return;
      }

      setStep("candidates");
      trackFastAddEvent("recognition_succeeded", {
        confidenceLevel: result.confidenceLevel,
        candidates: result.candidates.length,
      });
    } catch (error) {
      setRecognitionError(
        error instanceof Error
          ? error.message
          : getFastAddErrorCopy("recognition_unavailable").message,
      );
      setStep("search");
      trackFastAddEvent("recognition_failed", { reason: "service_error" });
    }
  }

  function submitAdd(duplicateAction: "check" | "increment" | "separate") {
    if (!selectedCard) {
      return;
    }

    setSubmitError(null);

    startTransition(async () => {
      const result = await submitFastAddCollectionItem(
        buildFormData({
          card: selectedCard,
          quantity,
          condition,
          notes,
          showOnProfile,
          duplicateAction,
        }),
      );

      if (result.status === "error") {
        setSubmitError(result.error);
        return;
      }

      if (result.status === "duplicate") {
        setDuplicateInfo(result.existing);
        setStep("duplicate");
        return;
      }

      setPreservedDefaults({ showOnProfile, condition });
      setLastAddedCard(selectedCard);
      setSuccessState({
        cardName: result.cardName,
        quantity: result.quantity,
        incremented: result.incremented,
      });
      setStep("success");
      trackFastAddEvent("collection_item_added", {
        incremented: result.incremented,
      });
    });
  }

  function addSameCardAgain() {
    if (!lastAddedCard) {
      return;
    }

    setSelectedCard(lastAddedCard);
    setQuantity(1);
    setNotes("");
    setShowOnProfile(preservedDefaults.showOnProfile);
    setCondition(preservedDefaults.condition);
    setDuplicateInfo(null);
    setSuccessState(null);
    setSubmitError(null);
    setStep("details");
  }

  return (
    <div className="space-y-8">
      <FastAddBackLink />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Fast Add</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Add cards quickly by searching, uploading a photo, or taking a picture on
          mobile web. Everything converges into one confirmation flow.
        </p>
      </div>

      {step === "entry" ? (
        <FastAddEntryMethods activeMethod={activeMethod} onSelect={handleSelectMethod} />
      ) : null}

      {step === "search" ? (
        <div className="space-y-4">
          {recognitionError ? (
            <p
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200"
              role="alert"
              aria-live="polite"
            >
              {recognitionError}
            </p>
          ) : null}

          {referenceImageUrl ? (
            <div className="flex gap-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={referenceImageUrl}
                alt="Your uploaded card for comparison"
                className="h-28 w-20 shrink-0 rounded-lg object-contain"
              />
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  Compare while you search
                </p>
                <p className="mt-1 text-xs">
                  Your photo stays visible while you confirm the correct catalog match.
                </p>
              </div>
            </div>
          ) : null}

          <FastCardSearch
            onSelect={handleSelectCard}
            autoFocus
            initialQuery={searchSeed}
          />
          <div className="flex flex-wrap gap-3">
            {referenceImageUrl ? (
              <button
                type="button"
                onClick={() => setStep(activeMethod === "camera" ? "camera" : "upload")}
                className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
              >
                Retake photo
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => resetFlow()}
              className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Change entry method
            </button>
          </div>
        </div>
      ) : null}

      {step === "upload" || step === "camera" ? (
        <div className="space-y-4">
          <CardImageUpload
            mode={step}
            onImageReady={(input) => {
              void recognizeImage(input);
            }}
            onError={(message) => {
              setRecognitionError(message);
            }}
          />
          {recognitionError ? (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              role="alert"
              aria-live="polite"
            >
              {recognitionError}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                openManualSearchFallback(recognitionResult);
                setRecognitionError(null);
              }}
              className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Search manually instead
            </button>
            <button
              type="button"
              onClick={() => resetFlow()}
              className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Change entry method
            </button>
          </div>
        </div>
      ) : null}

      {step === "recognizing" ? <RecognitionProgress /> : null}

      {step === "candidates" && recognitionResult ? (
        <div className="space-y-4">
          {referenceImageUrl ? (
            <div className="flex gap-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={referenceImageUrl}
                alt="Your uploaded card for comparison"
                className="h-28 w-20 shrink-0 rounded-lg object-contain"
              />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Pick the catalog match that best fits your photo.
              </p>
            </div>
          ) : null}
          <CardCandidateList
            candidates={recognitionResult.candidates}
            selectedCardId={selectedCard?.id}
            uncertain={recognitionResult.uncertain}
            message={recognitionResult.message}
            onSelect={(candidate) => {
              setSelectedCard(searchResultToSelectedCard(candidate));
              setStep("confirm");
              trackFastAddEvent("candidate_changed", { cardId: candidate.cardId });
            }}
          />
          <button
            type="button"
            onClick={() => openManualSearchFallback(recognitionResult)}
            className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
          >
            Search manually instead
          </button>
        </div>
      ) : null}

      {step === "confirm" && selectedCard ? (
        <CardConfirmation
          card={selectedCard}
          confidence={recognitionResult?.confidence}
          confidenceLevel={recognitionResult?.confidenceLevel}
          usedRecognition={usedRecognition}
          onConfirm={() => {
            trackFastAddEvent("card_confirmed", {
              source: usedRecognition ? "recognition" : "search",
            });
            setStep("details");
          }}
          onSearchManually={() => {
            setSearchSeed(selectedCard.name);
            setStep("search");
          }}
          onStartOver={() => resetFlow({ method: activeMethod })}
        />
      ) : null}

      {step === "details" && selectedCard ? (
        <AddCollectionDetails
          card={selectedCard}
          quantity={quantity}
          showOnProfile={showOnProfile}
          condition={condition}
          notes={notes}
          isSubmitting={isPending}
          onQuantityChange={setQuantity}
          onShowOnProfileChange={setShowOnProfile}
          onConditionChange={setCondition}
          onNotesChange={setNotes}
          onSubmit={() => submitAdd("check")}
          onBack={() => setStep("confirm")}
        />
      ) : null}

      {step === "duplicate" && duplicateInfo ? (
        <DuplicateCardDialog
          existing={duplicateInfo}
          requestedQuantity={quantity}
          isSubmitting={isPending}
          onIncreaseQuantity={() => submitAdd("increment")}
          onAddSeparate={() => submitAdd("separate")}
          onCancel={() => setStep("details")}
        />
      ) : null}

      {step === "success" && successState ? (
        <FastAddSuccess
          cardName={successState.cardName}
          quantity={successState.quantity}
          incremented={successState.incremented}
          preferCamera={activeMethod === "camera"}
          canAddSameCardAgain={Boolean(lastAddedCard)}
          onAddAnother={() =>
            resetFlow({
              method: activeMethod ?? "search",
              focusSearch: activeMethod !== "camera",
              preserveDefaults: true,
            })
          }
          onAddSameCardAgain={addSameCardAgain}
        />
      ) : null}

      {submitError ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          role="alert"
          aria-live="polite"
        >
          {submitError}
        </p>
      ) : null}
    </div>
  );
}
