'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Check, 
  X, 
  Move3D,
  Calculator,
  Puzzle,
  Image as ImageIcon,
  Target
} from 'lucide-react';

interface CreativeCaptchaProps {
  type?: 'math' | 'puzzle' | 'drag' | 'image';
  difficulty?: 'easy' | 'medium' | 'hard';
  onVerify: (verified: boolean) => void;
  primaryColor?: string;
  accentColor?: string;
  errorColor?: string;
}

interface MathProblem {
  question: string;
  answer: number;
  options: number[];
}

interface PuzzlePiece {
  id: number;
  value: string;
  correctPosition: number;
  currentPosition: number;
}

interface DragTarget {
  id: number;
  shape: 'circle' | 'square' | 'triangle';
  color: string;
  isCorrect: boolean;
}

export default function CreativeCaptcha({ 
  type = 'math', 
  difficulty = 'medium',
  onVerify,
  primaryColor = '#5243E9',
  accentColor = '#10B981',
  errorColor = '#EF4444'
}: CreativeCaptchaProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Math Captcha State
  const [mathProblem, setMathProblem] = useState<MathProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Puzzle Captcha State
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([]);
  const [puzzleTarget, setPuzzleTarget] = useState<string>('');

  // Drag Captcha State
  const [dragTargets, setDragTargets] = useState<DragTarget[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [completedTargets, setCompletedTargets] = useState<number[]>([]);

  // Image Pattern Captcha State
  const [imagePattern, setImagePattern] = useState<number[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<number[]>([]);

  const generateMathProblem = useCallback(() => {
    let question: string;
    let answer: number;
    let options: number[] = [];

    switch (difficulty) {
      case 'easy':
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const operation = Math.random() > 0.5 ? '+' : '-';
        if (operation === '+') {
          question = `${a} + ${b} = ?`;
          answer = a + b;
        } else {
          question = `${Math.max(a, b)} - ${Math.min(a, b)} = ?`;
          answer = Math.max(a, b) - Math.min(a, b);
        }
        break;
      case 'medium':
        const c = Math.floor(Math.random() * 12) + 1;
        const d = Math.floor(Math.random() * 12) + 1;
        question = `${c} × ${d} = ?`;
        answer = c * d;
        break;
      case 'hard':
        const e = Math.floor(Math.random() * 20) + 10;
        const f = Math.floor(Math.random() * 9) + 2;
        question = `${e} ÷ ${f} = ?`;
        answer = Math.floor(e / f);
        break;
      default:
        question = '2 + 2 = ?';
        answer = 4;
    }

    // Generate wrong options
    const wrongOptions: number[] = [];
    for (let i = 0; i < 3; i++) {
      let wrongAnswer;
      do {
        wrongAnswer = answer + Math.floor(Math.random() * 10) - 5;
      } while (wrongAnswer === answer || wrongOptions.includes(wrongAnswer) || wrongAnswer < 0);
      wrongOptions.push(wrongAnswer);
    }

    options = [answer, ...wrongOptions].sort(() => Math.random() - 0.5);

    setMathProblem({ question, answer, options });
  }, [difficulty]);

  const generatePuzzle = useCallback(() => {
    const words = ['SECURE', 'VERIFY', 'HUMAN', 'ACCESS', 'UNLOCK'];
    const targetWord = words[Math.floor(Math.random() * words.length)];
    const letters = targetWord.split('');
    
    const pieces: PuzzlePiece[] = letters.map((letter, index) => ({
      id: index,
      value: letter,
      correctPosition: index,
      currentPosition: index
    }));

    // Shuffle the pieces
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i].currentPosition, pieces[j].currentPosition] = [pieces[j].currentPosition, pieces[i].currentPosition];
    }

    setPuzzlePieces(pieces);
    setPuzzleTarget(targetWord);
  }, []);

  const generateDragTargets = useCallback(() => {
    // Create 3 drop zones, only one will be correct (randomize which one)
    const correctIndex = Math.floor(Math.random() * 3);
    const targets: DragTarget[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      shape: 'circle',
      color: '#E5E7EB',
      isCorrect: index === correctIndex
    }));

    setDragTargets(targets);
    setCompletedTargets([]);
    setDraggedItem(null);
  }, []);

  const generateImagePattern = useCallback(() => {
    const gridSize = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 9;
    const numCorrect = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
    
    // Generate random pattern positions
    const allPositions = Array.from({ length: gridSize }, (_, i) => i);
    const shuffled = allPositions.sort(() => Math.random() - 0.5);
    const correctPattern = shuffled.slice(0, numCorrect);
    
    setImagePattern(correctPattern);
    setSelectedPattern([]);
  }, [difficulty]);

  useEffect(() => {
    resetCaptcha();
  }, [type, difficulty]);

  const resetCaptcha = () => {
    setIsVerified(false);
    setSelectedAnswer(null);
    setShowError(false);
    setAttempts(0);
    setCompletedTargets([]);
    setSelectedPattern([]);
    setDraggedItem(null);

    switch (type) {
      case 'math':
        generateMathProblem();
        break;
      case 'puzzle':
        generatePuzzle();
        break;
      case 'drag':
        generateDragTargets();
        break;
      case 'image':
        generateImagePattern();
        break;
    }
  };

  const handleVerification = async () => {
    setLoading(true);
    setShowError(false);

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let success = false;

    switch (type) {
      case 'math':
        success = selectedAnswer === mathProblem?.answer;
        break;
      case 'puzzle':
        const sortedPieces = [...puzzlePieces].sort((a, b) => a.currentPosition - b.currentPosition);
        const currentWord = sortedPieces.map(p => p.value).join('');
        success = currentWord === puzzleTarget;
        break;
      case 'drag':
        success = completedTargets.length > 0 && dragTargets.some(target => 
          completedTargets.includes(target.id) && target.isCorrect
        );
        break;
      case 'image':
        success = selectedPattern.length === imagePattern.length && 
                 selectedPattern.every(item => imagePattern.includes(item));
        break;
    }

    if (success) {
      setIsVerified(true);
      onVerify(true);
    } else {
      setAttempts(prev => prev + 1);
      setShowError(true);
      if (attempts >= 2) {
        resetCaptcha();
      }
    }

    setLoading(false);
  };

  const handlePuzzleDrop = (draggedIndex: number, targetIndex: number) => {
    const newPieces = [...puzzlePieces];
    const draggedPiece = newPieces.find(p => p.currentPosition === draggedIndex);
    const targetPiece = newPieces.find(p => p.currentPosition === targetIndex);

    if (draggedPiece && targetPiece) {
      [draggedPiece.currentPosition, targetPiece.currentPosition] = 
      [targetPiece.currentPosition, draggedPiece.currentPosition];
      setPuzzlePieces(newPieces);
    }
  };

  const handleDragTarget = (targetId: number) => {
    if (!completedTargets.includes(targetId)) {
      const target = dragTargets.find(t => t.id === targetId);
      if (target?.isCorrect) {
        setCompletedTargets([targetId]);
      } else {
        // Wrong target - show error briefly
        setShowError(true);
        setTimeout(() => setShowError(false), 2000);
        setAttempts(prev => {
          const newAttempts = prev + 1;
          if (newAttempts >= 2) {
            // Reset captcha after 2 failed attempts
            setTimeout(() => {
              generateDragTargets();
              setAttempts(0);
              setShowError(false);
            }, 2000);
          }
          return newAttempts;
        });
      }
    }
  };

  const handleImagePatternClick = (index: number) => {
    if (selectedPattern.includes(index)) {
      setSelectedPattern(prev => prev.filter(i => i !== index));
    } else {
      setSelectedPattern(prev => [...prev, index]);
    }
  };

  const getCaptchaIcon = () => {
    switch (type) {
      case 'math': return <Calculator className="w-5 h-5" />;
      case 'puzzle': return <Puzzle className="w-5 h-5" />;
      case 'drag': return <Move3D className="w-5 h-5" />;
      case 'image': return <ImageIcon className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getCaptchaTitle = () => {
    switch (type) {
      case 'math': return 'Solve the math problem';
      case 'puzzle': return 'Arrange the letters to form a word';
      case 'drag': return 'Drag and drop verification';
      case 'image': return 'Select the matching pattern';
      default: return 'Complete the verification';
    }
  };

  if (isVerified) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-center justify-center gap-3 text-green-700">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: accentColor }}
          >
            <Check className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold">Verification Complete!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {getCaptchaIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{getCaptchaTitle()}</h3>
            <p className="text-sm text-gray-500">Verify you're human to continue</p>
          </div>
        </div>
        <button
          onClick={resetCaptcha}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh captcha"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Captcha Content */}
      <div className="space-y-4">
        {type === 'math' && mathProblem && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-4">
                {mathProblem.question}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {mathProblem.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(option)}
                    className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                      selectedAnswer === option
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {type === 'puzzle' && puzzlePieces.length > 0 && (
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-600 mb-2">
              Target word: <span className="font-semibold">{puzzleTarget}</span>
            </div>
            <div className="flex justify-center gap-2 flex-wrap">
              {Array.from({ length: puzzlePieces.length }, (_, index) => {
                const piece = puzzlePieces.find(p => p.currentPosition === index);
                return (
                  <div
                    key={index}
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center font-bold text-lg bg-white cursor-move hover:bg-gray-50 transition-colors"
                    draggable
                    onDragStart={() => setDraggedItem(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => draggedItem !== null && handlePuzzleDrop(draggedItem, index)}
                  >
                    {piece?.value}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {type === 'drag' && dragTargets.length > 0 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-600">
                Drag the <span className="font-semibold" style={{ color: primaryColor }}>circle</span> to the correct <span className="font-semibold" style={{ color: accentColor }}>target zone</span>
              </div>
              <div className="text-xs text-gray-500">
                Look for the zone that highlights when you hover over it
              </div>
            </div>
            
            {/* Draggable Item */}
            <div className="flex justify-center mb-6">
              <div 
                className="p-4 border-2 rounded-xl"
                style={{ 
                  backgroundColor: `${primaryColor}10`, 
                  borderColor: `${primaryColor}30` 
                }}
              >
                <div className="text-xs font-medium mb-2 text-center" style={{ color: primaryColor }}>
                  Drag me!
                </div>
                <div 
                  className="w-12 h-12 rounded-full cursor-move shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-2 border-white"
                  style={{ backgroundColor: primaryColor }}
                  draggable
                  onDragStart={(e) => {
                    setDraggedItem(0);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                />
              </div>
            </div>

            {/* Drop Zones */}
            <div className="space-y-2 mb-8">
              <div className="text-center text-xs text-gray-500 font-medium mb-8">DROP ZONES</div>
              <div className="flex justify-center gap-6">
                {dragTargets.map((target) => (
                  <div
                    key={target.id}
                    className={`relative w-20 h-20 border-3 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      completedTargets.includes(target.id) 
                        ? 'shadow-lg' 
                        : 'border-dashed hover:shadow-md'
                    }`}
                    style={{
                      backgroundColor: completedTargets.includes(target.id) 
                        ? `${accentColor}20` 
                        : target.isCorrect 
                          ? `${accentColor}10` 
                          : '#F9FAFB',
                      borderColor: completedTargets.includes(target.id) 
                        ? accentColor 
                        : target.isCorrect 
                          ? `${accentColor}50` 
                          : '#D1D5DB'
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      if (target.isCorrect) {
                        e.currentTarget.style.backgroundColor = `${accentColor}30`;
                        e.currentTarget.style.borderColor = accentColor;
                      } else {
                        e.currentTarget.style.backgroundColor = `${errorColor}20`;
                        e.currentTarget.style.borderColor = `${errorColor}60`;
                      }
                    }}
                    onDragLeave={(e) => {
                      if (completedTargets.includes(target.id)) {
                        e.currentTarget.style.backgroundColor = `${accentColor}20`;
                        e.currentTarget.style.borderColor = accentColor;
                      } else if (target.isCorrect) {
                        e.currentTarget.style.backgroundColor = `${accentColor}10`;
                        e.currentTarget.style.borderColor = `${accentColor}50`;
                      } else {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                        e.currentTarget.style.borderColor = '#D1D5DB';
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDragTarget(target.id);
                    }}
                  >
                    {/* Target Zone Label */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <div 
                        className="text-xs font-medium px-2 py-1 rounded"
                        style={{
                          color: target.isCorrect ? accentColor : '#6B7280',
                          backgroundColor: target.isCorrect ? `${accentColor}20` : '#F3F4F6'
                        }}
                      >
                        Zone {target.id + 1}
                      </div>
                    </div>
                    
                    {/* Success checkmark */}
                    {completedTargets.includes(target.id) && (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: accentColor }}
                      >
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    {/* Drop zone indicator */}
                    {!completedTargets.includes(target.id) && (
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-dashed"
                        style={{ 
                          borderColor: target.isCorrect ? `${accentColor}60` : '#9CA3AF' 
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Hint */}
            {attempts > 0 && !completedTargets.length && (
              <div 
                className="text-center text-xs p-2 rounded-lg"
                style={{ 
                  color: `${primaryColor}90`, 
                  backgroundColor: `${primaryColor}10` 
                }}
              >
                Hint: The correct zone will highlight when you hover over it with the circle
              </div>
            )}
          </div>
        )}

        {type === 'image' && imagePattern.length > 0 && (
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-600 mb-4">
              Select the squares that match the <span className="font-semibold" style={{ color: primaryColor }}>highlighted pattern</span>
            </div>
            <div className={`grid gap-2 mx-auto ${
              difficulty === 'easy' ? 'grid-cols-2 max-w-32' : 
              difficulty === 'medium' ? 'grid-cols-3 max-w-48' : 
              'grid-cols-3 max-w-48'
            }`}>
              {Array.from({ length: difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 9 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handleImagePatternClick(index)}
                  className="w-12 h-12 border-2 rounded-lg transition-all"
                  style={{
                    borderColor: selectedPattern.includes(index) 
                      ? primaryColor 
                      : imagePattern.includes(index) 
                        ? accentColor 
                        : '#D1D5DB',
                    backgroundColor: selectedPattern.includes(index) 
                      ? `${primaryColor}20` 
                      : imagePattern.includes(index) 
                        ? `${accentColor}20` 
                        : '#FFFFFF'
                  }}
                >
                  {imagePattern.includes(index) && (
                    <div 
                      className="w-full h-full rounded"
                      style={{ backgroundColor: `${accentColor}60` }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="text-center text-xs text-gray-500">
              Click the squares that have the highlighted pattern
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {showError && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <X className="w-4 h-4" />
          <span className="text-sm">
            Incorrect answer. {attempts >= 2 ? 'Generating new challenge...' : 'Please try again.'}
          </span>
        </div>
      )}

      {/* Verify Button */}
      <button
        onClick={handleVerification}
        disabled={loading || 
          (type === 'math' && selectedAnswer === null) ||
          (type === 'drag' && completedTargets.length === 0) ||
          (type === 'puzzle' && puzzlePieces.length === 0) ||
          (type === 'image' && selectedPattern.length === 0)
        }
        className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
        style={{ backgroundColor: primaryColor }}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Verifying...</span>
          </div>
        ) : (
          'Verify'
        )}
      </button>

      {/* Attempts Counter */}
      {attempts > 0 && (
        <div className="text-xs text-gray-500 text-center">
          Attempt {attempts + 1} of 3
        </div>
      )}
    </div>
  );
} 