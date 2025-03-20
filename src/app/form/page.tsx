'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function FormPage() {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [gender, setGender] = useState<string | undefined>(undefined)
  const [partTimeJob, setPartTimeJob] = useState<string | undefined>(undefined)
  const [extracurricular, setExtracurricular] = useState<string | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const [predictions, setPredictions] = useState<Array<{ career: string; probability: number }>>([])
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const validateInputs = () => {
    const newErrors: { [key: string]: string } = {}
    const studyHours = parseInt((document.getElementById('studyHours') as HTMLInputElement).value)
    const mathScore = parseFloat((document.getElementById('mathScore') as HTMLInputElement).value)
    const historyScore = parseFloat((document.getElementById('historyScore') as HTMLInputElement).value)
    const physicsScore = parseFloat((document.getElementById('physicsScore') as HTMLInputElement).value)
    const chemistryScore = parseFloat((document.getElementById('chemistryScore') as HTMLInputElement).value)
    const biologyScore = parseFloat((document.getElementById('biologyScore') as HTMLInputElement).value)
    const englishScore = parseFloat((document.getElementById('englishScore') as HTMLInputElement).value)
    const geographyScore = parseFloat((document.getElementById('geographyScore') as HTMLInputElement).value)

    if (!gender) newErrors['gender'] = 'Gender is required.'
    if (!partTimeJob) newErrors['partTimeJob'] = 'Part-time job status is required.'
    if (!extracurricular) newErrors['extracurricular'] = 'Extracurricular activity status is required.'
    if (isNaN(studyHours)) newErrors['studyHours'] = 'Study hours are required.'
    else if (studyHours < 0 || studyHours > 50) newErrors['studyHours'] = 'Study hours must be between 0 and 50.'
    
    // Validate each subject score
    if (isNaN(mathScore)) newErrors['mathScore'] = 'Math score is required.'
    else if (mathScore < 0 || mathScore > 100) newErrors['mathScore'] = 'Math score must be between 0 and 100.'

    if (isNaN(historyScore)) newErrors['historyScore'] = 'History score is required.'
    else if (historyScore < 0 || historyScore > 100) newErrors['historyScore'] = 'History score must be between 0 and 100.'

    if (isNaN(physicsScore)) newErrors['physicsScore'] = 'Physics score is required.'
    else if (physicsScore < 0 || physicsScore > 100) newErrors['physicsScore'] = 'Physics score must be between 0 and 100.'

    if (isNaN(chemistryScore)) newErrors['chemistryScore'] = 'Chemistry score is required.'
    else if (chemistryScore < 0 || chemistryScore > 100) newErrors['chemistryScore'] = 'Chemistry score must be between 0 and 100.'

    if (isNaN(biologyScore)) newErrors['biologyScore'] = 'Biology score is required.'
    else if (biologyScore < 0 || biologyScore > 100) newErrors['biologyScore'] = 'Biology score must be between 0 and 100.'

    if (isNaN(englishScore)) newErrors['englishScore'] = 'English score is required.'
    else if (englishScore < 0 || englishScore > 100) newErrors['englishScore'] = 'English score must be between 0 and 100.'

    if (isNaN(geographyScore)) newErrors['geographyScore'] = 'Geography score is required.'
    else if (geographyScore < 0 || geographyScore > 100) newErrors['geographyScore'] = 'Geography score must be between 0 and 100.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateInputs()) {
      setIsLoading(true)
      try {
        const studyHours = parseInt((document.getElementById('studyHours') as HTMLInputElement).value)
        const mathScore = parseFloat((document.getElementById('mathScore') as HTMLInputElement).value)
        const historyScore = parseFloat((document.getElementById('historyScore') as HTMLInputElement).value)
        const physicsScore = parseFloat((document.getElementById('physicsScore') as HTMLInputElement).value)
        const chemistryScore = parseFloat((document.getElementById('chemistryScore') as HTMLInputElement).value)
        const biologyScore = parseFloat((document.getElementById('biologyScore') as HTMLInputElement).value)
        const englishScore = parseFloat((document.getElementById('englishScore') as HTMLInputElement).value)
        const geographyScore = parseFloat((document.getElementById('geographyScore') as HTMLInputElement).value)

        const requestData = {
          gender: gender === 'male' ? 1 : 0,
          part_time_job: partTimeJob === 'yes' ? 1 : 0,
          extracurricular_activities: extracurricular === 'yes' ? 1 : 0,
          weekly_study_hours: studyHours,
          math_score: mathScore,
          history_score: historyScore,
          physics_score: physicsScore,
          chemistry_score: chemistryScore,
          biology_score: biologyScore,
          english_score: englishScore,
          geography_score: geographyScore
        }

        console.log('Sending request with data:', requestData)

        const response = await fetch('http://localhost:8000/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        })

        console.log('Response status:', response.status)
        const data = await response.json()
        console.log('Response data:', data)

        if (!response.ok) {
          let errorMessage = 'Failed to get prediction'
          if (data.detail) {
            if (typeof data.detail === 'string') {
              errorMessage = data.detail
            } else if (typeof data.detail === 'object') {
              errorMessage = JSON.stringify(data.detail)
            }
          }
          throw new Error(errorMessage)
        }

        setPredictions(data.predictions)
        setIsDialogOpen(true)
      } catch (error) {
        console.error('Error:', error)
        let errorMessage = 'Failed to get prediction. Please try again.'
        
        if (error instanceof Error) {
          const message = error.message.toLowerCase()
          if (message.includes('failed to fetch')) {
            errorMessage = 'Unable to connect to the prediction service. Please ensure the server is running.'
          } else if (message.includes('scaling')) {
            errorMessage = 'Error processing your data. Please check your input values.'
          } else if (message.includes('prediction')) {
            errorMessage = 'Error generating career prediction. Please try again.'
          } else {
            errorMessage = error.message
          }
        }
        
        setErrorMessage(errorMessage)
        setIsErrorDialogOpen(true)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#EBF3FF] p-4">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Personal Information Section */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <p className="text-gray-600 text-sm">Provide your personal details</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Gender <span className="text-red-500">*</span></label>
              <Select name="gender" onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors['gender'] && <p className="text-red-600 text-xs">{errors['gender']}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Has a part-time job? <span className="text-red-500">*</span></label>
              <Select name="part_time_job" onValueChange={setPartTimeJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Select yes/no" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors['partTimeJob'] && <p className="text-red-600 text-xs">{errors['partTimeJob']}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Weekly study hours? <span className="text-red-500">*</span></label>
              <Input 
                id="studyHours" 
                name="weekly_study_hours"
                type="number" 
                placeholder="Enter hours" 
              />
              {errors['studyHours'] && <p className="text-red-600 text-xs">{errors['studyHours']}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Involved in extracurricular activities? <span className="text-red-500">*</span></label>
              <Select name="extracurricular_activities" onValueChange={setExtracurricular}>
                <SelectTrigger>
                  <SelectValue placeholder="Select yes/no" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors['extracurricular'] && <p className="text-red-600 text-xs">{errors['extracurricular']}</p>}
            </div>
          </div>
        </section>

        {/* Academic Information Section */}
        <section className="space-y-2 mt-8">
          <h2 className="text-xl font-semibold">Academic Information</h2>
          <p className="text-gray-600 text-sm">Provide your academic details</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Math score <span className="text-red-500">*</span></label>
              <Input 
                id="mathScore" 
                name="math_score"
                type="number" 
                placeholder="Enter score" 
              />
              {errors['mathScore'] && <p className="text-red-600 text-xs">{errors['mathScore']}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">History score <span className="text-red-500">*</span></label>
              <Input 
                id="historyScore" 
                name="history_score"
                type="number" 
                placeholder="Enter score" 
              />
              {errors['historyScore'] && <p className="text-red-600 text-xs">{errors['historyScore']}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Physics score <span className="text-red-500">*</span></label>
              <Input 
                id="physicsScore" 
                name="physics_score"
                type="number" 
                placeholder="Enter score" 
              />
              {errors['physicsScore'] && <p className="text-red-600 text-xs">{errors['physicsScore']}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chemistry score <span className="text-red-500">*</span></label>
              <Input 
                id="chemistryScore" 
                name="chemistry_score"
                type="number" 
                placeholder="Enter score" 
              />
              {errors['chemistryScore'] && <p className="text-red-600 text-xs">{errors['chemistryScore']}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Biology score <span className="text-red-500">*</span></label>
              <Input 
                id="biologyScore" 
                name="biology_score"
                type="number" 
                placeholder="Enter score" 
              />
              {errors['biologyScore'] && <p className="text-red-600 text-xs">{errors['biologyScore']}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">English score <span className="text-red-500">*</span></label>
              <Input 
                id="englishScore" 
                name="english_score"
                type="number" 
                placeholder="Enter score" 
              />
              {errors['englishScore'] && <p className="text-red-600 text-xs">{errors['englishScore']}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Geography score <span className="text-red-500">*</span></label>
              <Input 
                id="geographyScore" 
                name="geography_score"
                type="number" 
                placeholder="Enter score" 
              />
              {errors['geographyScore'] && <p className="text-red-600 text-xs">{errors['geographyScore']}</p>}
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4 mt-8">
          <Button
            variant="outline"
            className="bg-white hover:cursor-pointer"
            onClick={() => window.history.back()}
          >
            Back
          </Button>
          <Button 
            className="bg-[#1E40AF] hover:bg-[#1E3A8A] hover:cursor-pointer text-white"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Submit"}
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-blue-600">
                Career Recommendations
              </DialogTitle>
              <DialogDescription className="text-center pt-4">
                Based on your academic performance and personal information
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <div className="space-y-4">
                {predictions.map((pred, index) => (
                  <div key={index} className={`bg-blue-50 p-4 rounded-lg ${index === 0 ? 'border-2 border-blue-500' : ''}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {index === 0 ? '🏆 Top Recommendation:' : `${index + 1}. Alternative Option:`}
                        </h3>
                        <p className="text-xl text-blue-700 font-bold">{pred.career}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">Match</span>
                        <p className="text-lg font-bold text-blue-600">{pred.probability}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-red-600">
                Error
              </DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-700">{errorMessage}</p>
              </div>
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={() => setIsErrorDialogOpen(false)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
} 