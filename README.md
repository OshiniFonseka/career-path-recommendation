# FindMyCareer 🎯

A modern web application that helps students discover potential career paths based on their academic performance and personal characteristics.

## Overview

FindMyCareer uses machine learning to analyze student data and provide personalized career recommendations. The application considers various factors including:
- Academic performance across different subjects
- Personal characteristics
- Study habits
- Extracurricular involvement

## Features

- 🎨 Modern, responsive user interface
- 📊 Comprehensive form for data collection
- 🤖 Machine learning-powered predictions
- 📈 Top 3 career recommendations with match percentages
- ✨ Real-time input validation
- 🛡️ Error handling

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui components

### Backend
- FastAPI
- Python
- Scikit-learn
- Pandas
- NumPy

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd [repository-name]
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Navigate to the landing page
2. Click "Click for Recommendations" to access the form
3. Fill in your personal and academic information
4. Submit the form to receive career recommendations
5. View your top 3 career matches with compatibility percentages

## Input Requirements

### Personal Information
- Gender (required)
- Part-time job status (required)
- Weekly study hours (0-50 hours)
- Extracurricular activities status (required)

### Academic Scores
All academic scores must be between 0 and 100:
- Mathematics
- History
- Physics
- Chemistry
- Biology
- English
- Geography

## Development

The application is structured as follows:
- `/src/app` - Next.js application pages and components
- `/backend` - FastAPI server and ML model
- `/public` - Static assets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and FastAPI
- UI components from shadcn/ui
- Machine learning model trained on student career data
