import React, { useState, useEffect } from 'react';
import { BloodGroup, BloodComponent } from '../../types/blood';
import {
  ALL_BLOOD_GROUPS,
  BLOOD_PROPERTIES_MAP,
  getCompatibleRecipientTypes,
  getCompatibleDonorTypes,
  isBloodCompatible
} from '../../utils/compatibility';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, RotateCcw, Award, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

type QuestionType = 'DONOR_TARGETS' | 'RECIPIENT_SOURCES' | 'DIRECT_YES_NO';

interface ExamQuestion {
  id: string;
  type: QuestionType;
  role: 'DONOR' | 'RECIPIENT';
  subjectBloodType: BloodGroup;
  component: BloodComponent;
  targetBloodType?: BloodGroup; // For DIRECT_YES_NO
  prompt: string;
  subPrompt: string;
  correctAnswers: BloodGroup[]; // For multi-select
  correctYesNo?: boolean; // For YES/NO
  explanation: string;
}

function generateRandomQuestion(): ExamQuestion {
  const types = ALL_BLOOD_GROUPS;
  const randomSubject = types[Math.floor(Math.random() * types.length)];
  const qTypeRoll = Math.random();

  if (qTypeRoll < 0.4) {
    // DONOR_TARGETS: Select all recipients this donor can give to
    const correctRecipients = getCompatibleRecipientTypes(randomSubject, 'RBC');
    return {
      id: `q-${Date.now()}-${Math.random()}`,
      type: 'DONOR_TARGETS',
      role: 'DONOR',
      subjectBloodType: randomSubject,
      component: 'RBC',
      prompt: `A person is a DONOR with blood type ${randomSubject}.`,
      subPrompt: 'Select ALL the blood types that can safely receive this donor’s red blood cells:',
      correctAnswers: correctRecipients,
      explanation: `Donor ${randomSubject} red blood cells express: [${BLOOD_PROPERTIES_MAP[randomSubject].rbcAntigens.join(', ')}]. Compatible recipients are: ${correctRecipients.join(', ')}.`,
    };
  } else if (qTypeRoll < 0.8) {
    // RECIPIENT_SOURCES: Select all donors this recipient can receive from
    const correctDonors = getCompatibleDonorTypes(randomSubject, 'RBC');
    return {
      id: `q-${Date.now()}-${Math.random()}`,
      type: 'RECIPIENT_SOURCES',
      role: 'RECIPIENT',
      subjectBloodType: randomSubject,
      component: 'RBC',
      prompt: `A patient is a RECIPIENT with blood type ${randomSubject}.`,
      subPrompt: 'Select ALL the donor blood types that can safely donate red blood cells to this patient:',
      correctAnswers: correctDonors,
      explanation: `Recipient ${randomSubject} plasma contains antibodies: [${BLOOD_PROPERTIES_MAP[randomSubject].plasmaAntibodies.join(', ') || 'None'}]. Safe donor blood types are: ${correctDonors.join(', ')}.`,
    };
  } else {
    // DIRECT_YES_NO: Can Donor X give to Recipient Y?
    const randomTarget = types[Math.floor(Math.random() * types.length)];
    const isComp = isBloodCompatible(randomSubject, randomTarget, 'RBC');
    return {
      id: `q-${Date.now()}-${Math.random()}`,
      type: 'DIRECT_YES_NO',
      role: 'DONOR',
      subjectBloodType: randomSubject,
      targetBloodType: randomTarget,
      component: 'RBC',
      prompt: `Can a DONOR with blood type ${randomSubject} safely give red blood cells to a RECIPIENT with blood type ${randomTarget}?`,
      subPrompt: 'Select whether this transfusion is compatible or incompatible:',
      correctAnswers: [],
      correctYesNo: isComp,
      explanation: isComp
        ? `YES, COMPATIBLE. Recipient ${randomTarget} can safely receive Donor ${randomSubject} red blood cells without hemolytic reaction.`
        : `NO, INCOMPATIBLE. Recipient antibodies or Rh mismatch will trigger acute hemolytic destruction of Donor ${randomSubject} cells!`,
    };
  }
}

export const QuizExaminer: React.FC = () => {
  const [question, setQuestion] = useState<ExamQuestion>(() => generateRandomQuestion());
  const [selectedTypes, setSelectedTypes] = useState<BloodGroup[]>([]);
  const [selectedYesNo, setSelectedYesNo] = useState<boolean | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [streak, setStreak] = useState(0);

  // Toggle multi-select blood group
  const handleToggleType = (type: BloodGroup) => {
    if (isChecked) return; // locked after check
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Evaluate the answer
  const handleCheckAnswer = () => {
    if (isChecked) return;
    setIsChecked(true);
    setTotalAttempted((prev) => prev + 1);

    let isCorrect = false;

    if (question.type === 'DIRECT_YES_NO') {
      isCorrect = selectedYesNo === question.correctYesNo;
    } else {
      // Both sets must match exactly
      const chosenSorted = [...selectedTypes].sort().join(',');
      const correctSorted = [...question.correctAnswers].sort().join(',');
      isCorrect = chosenSorted === correctSorted;
    }

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#8b1d2c', '#cbbba0', '#216e39', '#e8c0c4'],
      });
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setQuestion(generateRandomQuestion());
    setSelectedTypes([]);
    setSelectedYesNo(null);
    setIsChecked(false);
  };

  const handleResetScores = () => {
    setScore(0);
    setTotalAttempted(0);
    setStreak(0);
    handleNextQuestion();
  };

  // Evaluation details for multi-select
  const isMultiSelectCorrect =
    question.type !== 'DIRECT_YES_NO' &&
    [...selectedTypes].sort().join(',') === [...question.correctAnswers].sort().join(',');

  const isYesNoCorrect =
    question.type === 'DIRECT_YES_NO' && selectedYesNo === question.correctYesNo;

  const isOverallCorrect = question.type === 'DIRECT_YES_NO' ? isYesNoCorrect : isMultiSelectCorrect;

  return (
    <div className="parchment-card p-6 sm:p-8 rounded-lg border-2 border-[#cbbba0] space-y-6">
      {/* Header & Score Bar */}
      <div className="border-b border-[#ded7c8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#8b1d2c] font-bold">
            Interactive Examination Ground
          </span>
          <h2 className="text-xl sm:text-2xl font-serif text-[#29221b] mt-0.5">
            Test &amp; Verify Your Compatibility Knowledge
          </h2>
          <p className="text-xs font-serif italic text-[#635647] mt-0.5">
            Select the possible answers and check automatically whether your clinical judgment is right or wrong.
          </p>
        </div>

        {/* Score Ledger */}
        <div className="flex items-center gap-3 bg-[#faf6ee] p-2.5 rounded border border-[#ded7c8] self-start sm:self-auto text-xs font-serif">
          <div>
            <span className="text-[10px] uppercase font-sans text-[#8a7b69] block">Score</span>
            <span className="font-bold text-base text-[#29221b]">
              {score} / {totalAttempted}
            </span>
          </div>
          <span className="text-[#ded7c8]">·</span>
          <div>
            <span className="text-[10px] uppercase font-sans text-[#8a7b69] block">Streak</span>
            <span className="font-bold text-base text-[#8b1d2c]">
              {streak} 🔥
            </span>
          </div>
          <button
            onClick={handleResetScores}
            className="ml-2 text-[10px] text-[#8a7b69] hover:text-[#29221b] underline"
            title="Reset Score"
          >
            Reset
          </button>
        </div>
      </div>

      {/* The Question Prompt */}
      <div className="p-5 bg-[#faf7f0] rounded-lg border border-[#ded7c8]">
        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#8a7a65] block mb-1">
          Clinical Case Question
        </span>
        <h3 className="text-lg sm:text-xl font-serif font-bold text-[#29221b] leading-snug">
          {question.prompt}
        </h3>
        <p className="text-xs font-serif italic text-[#6e6050] mt-1.5">
          {question.subPrompt}
        </p>
      </div>

      {/* Answer Selection Stage */}
      {question.type === 'DIRECT_YES_NO' ? (
        /* YES / NO Selection */
        <div className="space-y-3">
          <label className="block text-xs uppercase tracking-wider text-[#7a6b57] font-semibold">
            Choose Your Verdict:
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled={isChecked}
              onClick={() => setSelectedYesNo(true)}
              className={`p-4 rounded border text-center font-serif text-lg font-bold transition-all ${
                selectedYesNo === true
                  ? 'bg-[#8b1d2c] text-white border-[#721422] shadow-sm'
                  : 'bg-white text-[#29221b] border-[#ded7c8] hover:bg-[#faf7f0]'
              } ${isChecked ? 'cursor-default' : ''}`}
            >
              YES — Compatible
            </button>

            <button
              type="button"
              disabled={isChecked}
              onClick={() => setSelectedYesNo(false)}
              className={`p-4 rounded border text-center font-serif text-lg font-bold transition-all ${
                selectedYesNo === false
                  ? 'bg-[#8b1d2c] text-white border-[#721422] shadow-sm'
                  : 'bg-white text-[#29221b] border-[#ded7c8] hover:bg-[#faf7f0]'
              } ${isChecked ? 'cursor-default' : ''}`}
            >
              NO — Incompatible
            </button>
          </div>
        </div>
      ) : (
        /* Multi-Choice Blood Group Selection */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs uppercase tracking-wider text-[#7a6b57] font-semibold">
              Select All Compatible Blood Types:
            </label>
            <span className="text-[11px] font-serif italic text-[#8a7a65]">
              {selectedTypes.length} selected
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-2.5">
            {ALL_BLOOD_GROUPS.map((type) => {
              const isSelected = selectedTypes.includes(type);
              const isActuallyCorrect = question.correctAnswers.includes(type);

              let buttonStyle = 'bg-white text-[#29221b] border-[#ded7c8] hover:bg-[#faf7f0]';

              if (!isChecked) {
                if (isSelected) {
                  buttonStyle = 'bg-[#8b1d2c] text-white border-[#721422] shadow-sm font-bold ring-1 ring-[#cbbba0]';
                }
              } else {
                // Evaluated state colors:
                if (isSelected && isActuallyCorrect) {
                  // User correctly picked it
                  buttonStyle = 'bg-[#eef7f0] text-[#19532b] border-[#216e39] font-bold ring-2 ring-[#216e39]';
                } else if (isSelected && !isActuallyCorrect) {
                  // User incorrectly picked it (Wrong!)
                  buttonStyle = 'bg-[#fcf2f4] text-[#8b1d2c] border-[#8b1d2c] font-bold line-through ring-2 ring-[#8b1d2c]';
                } else if (!isSelected && isActuallyCorrect) {
                  // User missed it (Should have been picked!)
                  buttonStyle = 'bg-[#f0f9f2] text-[#216e39] border-[#216e39] border-dashed font-bold';
                } else {
                  // Neither picked nor correct
                  buttonStyle = 'bg-[#faf8f5] text-[#998b7a] border-[#e8e2d6] opacity-60';
                }
              }

              return (
                <button
                  key={type}
                  type="button"
                  disabled={isChecked}
                  onClick={() => handleToggleType(type)}
                  className={`py-3 px-1 text-center rounded border font-serif text-lg transition-all ${buttonStyle}`}
                >
                  <span className="block font-bold">{type}</span>
                  {isChecked && (
                    <span className="text-[9px] uppercase font-sans block mt-0.5">
                      {isSelected && isActuallyCorrect && '✓ Correct'}
                      {isSelected && !isActuallyCorrect && '✗ Wrong'}
                      {!isSelected && isActuallyCorrect && '+ Missed'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Bar: Check Button or Next Question */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#ded7c8]">
        {!isChecked ? (
          <button
            type="button"
            onClick={handleCheckAnswer}
            disabled={
              question.type === 'DIRECT_YES_NO'
                ? selectedYesNo === null
                : selectedTypes.length === 0
            }
            className={`w-full sm:w-auto px-6 py-2.5 rounded font-serif font-bold text-sm transition-all ${
              (question.type === 'DIRECT_YES_NO' ? selectedYesNo !== null : selectedTypes.length > 0)
                ? 'bg-[#8b1d2c] hover:bg-[#721422] text-white shadow-sm'
                : 'bg-[#e8e2d6] text-[#9c8e7c] cursor-not-allowed'
            }`}
          >
            Check My Answer (Verify)
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNextQuestion}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#29221b] hover:bg-[#1c1712] text-white rounded font-serif font-bold text-sm shadow-sm transition-colors"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <div className="text-xs font-serif italic text-[#7a6b57]">
          {isChecked
            ? 'Review the detailed immunological feedback below.'
            : 'Make your selections above, then click Check to verify.'}
        </div>
      </div>

      {/* AUTOMATIC EVALUATION VERDICT CARD */}
      {isChecked && (
        <div
          className={`p-6 rounded-lg border-2 transition-all space-y-3 ${
            isOverallCorrect
              ? 'bg-[#f7fbf8] border-[#216e39] text-[#19532b]'
              : 'bg-[#fcf5f5] border-[#8b1d2c] text-[#8b1d2c]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isOverallCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-[#216e39] stroke-[2.5]" />
            ) : (
              <XCircle className="w-6 h-6 text-[#8b1d2c] stroke-[2.5]" />
            )}
            <h4 className="font-serif font-bold text-lg sm:text-xl uppercase tracking-wider">
              {isOverallCorrect ? 'RIGHT! EXCELLENT CLINICAL JUDGMENT' : 'WRONG! TRANSFUSION MISMATCH DETECTED'}
            </h4>
          </div>

          <p className="font-serif text-sm text-[#29221b] leading-relaxed">
            {question.explanation}
          </p>

          {/* If multi-choice, show exact breakdown */}
          {question.type !== 'DIRECT_YES_NO' && (
            <div className="pt-2 border-t border-[#ded7c8] text-xs font-serif space-y-1 text-[#42372c]">
              <div>
                <strong>The full correct answer is:</strong>{' '}
                <span className="font-bold text-[#19532b]">
                  {question.correctAnswers.join(', ')}
                </span>
              </div>
              <div>
                <strong>Your submission was:</strong>{' '}
                <span>
                  {selectedTypes.length > 0 ? selectedTypes.join(', ') : 'None selected'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
