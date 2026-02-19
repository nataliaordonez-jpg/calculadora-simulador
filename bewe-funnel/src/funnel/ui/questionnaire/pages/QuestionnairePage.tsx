import { useState, useCallback } from 'react'
import { Button } from '@beweco/aurora-ui'
import { FunnelLayout } from '../../_shared/components/funnel-layout/FunnelLayout'
import { QuestionCard } from '../components/question-card/QuestionCard'
import { QuestionProgressBar } from '../components/question-progress-bar/QuestionProgressBar'
import { useFunnelContext } from '../../_shared/context/funnel-context'
import { useFunnelNavigation } from '../../_shared/hooks/use-funnel-navigation'
import { FunnelStep } from '@funnel/domain/enums/funnel-step.enum'
import { QUESTIONS } from '@funnel/domain/constants/questions.constant'
import { BILLING_OPTIONS } from '@funnel/domain/constants/currency-rates.constant'
import type { IQuestionOption, IQuestionnaireAnswer } from '@funnel/domain/interfaces/questionnaire.interface'

export function QuestionnairePage() {
  const { state, dispatch } = useFunnelContext()
  const { goToStep } = useFunnelNavigation()
  const [currentIndex, setCurrentIndex] = useState(0)

  const { businessConfig, questionnaire } = state
  const totalQuestions = QUESTIONS.length

  const getAdaptedQuestion = useCallback((questionIndex: number) => {
    const question = QUESTIONS[questionIndex]
    if (question.id === 'p2') {
      const currencyOptions = BILLING_OPTIONS[businessConfig.currency]
      return {
        ...question,
        options: currencyOptions.map((opt: { label: string; value: number }, i: number) => ({
          id: `p2_opt${i + 1}`,
          label: opt.label,
          value: `range_${i + 1}`,
          numericValue: opt.value,
        })),
      }
    }
    return question
  }, [businessConfig.currency])

  const currentQuestion = getAdaptedQuestion(currentIndex)

  const currentAnswer = questionnaire.answers.find(
    (a: IQuestionnaireAnswer) => a.questionId === currentQuestion.id
  )

  const handleAnswer = useCallback((optionId: string, option: IQuestionOption) => {
    const answer: IQuestionnaireAnswer = {
      questionId: currentQuestion.id,
      questionNumber: currentQuestion.number,
      selectedOptionId: optionId,
      numericValue: option.numericValue,
    }

    dispatch({ type: 'ANSWER_QUESTION', payload: answer })

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        dispatch({ type: 'COMPLETE_QUESTIONNAIRE' })
        goToStep(FunnelStep.PROCESSING)
      }
    }, 400)
  }, [currentQuestion, currentIndex, totalQuestions, dispatch, goToStep])

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    } else {
      goToStep(FunnelStep.ONBOARDING)
    }
  }

  return (
    <FunnelLayout showHeader={false}>
      <div className="max-w-2xl mx-auto px-6 md:px-12 pb-8" style={{ paddingTop: '64px' }}>
        <QuestionProgressBar current={currentIndex} total={totalQuestions} />

        <div style={{ marginTop: '40px' }}>
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            sector={businessConfig.sector}
            selectedOptionId={currentAnswer?.selectedOptionId ?? ''}
            onAnswer={handleAnswer}
            questionIndex={currentIndex}
            totalQuestions={totalQuestions}
          />
        </div>

        <div className="flex items-center justify-between" style={{ marginTop: '40px' }}>
          <Button
            variant="light"
            color="primary"
            onPress={handleBack}
          >
            ← Atrás
          </Button>

          {/* Etiqueta "Selecciona para continuar" — visible solo sin opción seleccionada */}
          {!currentAnswer?.selectedOptionId && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cyan-light/15 text-small text-base-dark">
              ↑ Selecciona para continuar
            </span>
          )}
        </div>
      </div>
    </FunnelLayout>
  )
}
