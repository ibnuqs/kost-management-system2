#!/bin/bash

# =============================================================================
# POTUNA KOST - Development Starter Script
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[POTUNA-KOST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required directories exist
check_directories() {
    print_status "Checking project structure..."
    
    if [ ! -d "kost-backend" ]; then
        print_error "kost-backend directory not found!"
        exit 1
    fi
    
    if [ ! -d "kost-frontend" ]; then
        print_error "kost-frontend directory not found!"
        exit 1
    fi
    
    print_success "Project directories found"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    # Check PHP
    if ! command -v php &> /dev/null; then
        print_error "PHP is not installed!"
        exit 1
    fi
    
    # Check Composer
    if ! command -v composer &> /dev/null; then
        print_error "Composer is not installed!"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        exit 1
    fi
    
    # Check NPM
    if ! command -v npm &> /dev/null; then
        print_error "NPM is not installed!"
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Setup backend
setup_backend() {
    print_status "Setting up Laravel backend..."
    
    cd kost-backend
    
    # Install dependencies if needed
    if [ ! -d "vendor" ]; then
        print_status "Installing PHP dependencies..."
        composer install --no-interaction
    fi
    
    # Setup environment
    if [ ! -f ".env" ]; then
        print_status "Creating backend .env file..."
        cp .env.example .env
        php artisan key:generate
    fi
    
    # Check database connection and migrate
    print_status "Checking database..."
    if php artisan migrate:status &> /dev/null; then
        print_success "Database connection OK"
    else
        print_warning "Running database migrations..."
        php artisan migrate --force
    fi
    
    cd ..
    print_success "Backend setup complete"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up React frontend..."
    
    cd kost-frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies..."
        npm install
    fi
    
    # Ensure .env.local exists
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found, using .env"
    fi
    
    cd ..
    print_success "Frontend setup complete"
}

# Function to kill processes on exit
cleanup() {
    print_status "Shutting down services..."
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        print_status "Backend stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        print_status "Frontend stopped"
    fi
    
    print_success "All services stopped"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Main execution
main() {
    print_status "🏠 Starting Potuna Kost Development Environment..."
    echo
    
    # Run checks
    check_directories
    check_requirements
    
    # Setup services
    setup_backend
    setup_frontend
    
    print_status "🚀 Starting services..."
    echo
    
    # Start backend
    print_status "Starting Laravel backend on http://localhost:8000..."
    cd kost-backend
    php artisan serve --port=8000 --host=0.0.0.0 > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Check if backend started successfully
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_success "✅ Backend started (PID: $BACKEND_PID)"
        print_status "   📋 API: http://localhost:8000/api"
        print_status "   📊 Admin: http://localhost:8000/admin"
    else
        print_error "Failed to start backend! Check backend.log"
        exit 1
    fi
    
    # Start frontend
    print_status "Starting React frontend on http://localhost:3000..."
    cd kost-frontend
    npm run dev:local > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Wait a moment for frontend to start
    sleep 5
    
    # Check if frontend started successfully
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_success "✅ Frontend started (PID: $FRONTEND_PID)"
        print_status "   🌐 App: http://localhost:3000"
    else
        print_error "Failed to start frontend! Check frontend.log"
        exit 1
    fi
    
    echo
    print_success "🎉 Potuna Kost Development Environment is ready!"
    echo
    print_status "📱 Services running:"
    print_status "   • Frontend: http://localhost:3000"
    print_status "   • Backend API: http://localhost:8000/api"
    print_status "   • Laravel Admin: http://localhost:8000"
    echo
    print_status "🔧 Features available:"
    print_status "   • 🔐 Authentication & User Management"
    print_status "   • 🏠 Room & Tenant Management" 
    print_status "   • 💳 Payment Integration (Midtrans Sandbox)"
    print_status "   • 📊 Dashboard & Analytics"
    print_status "   • 🔔 Real-time Notifications"
    print_status "   • 📱 MQTT/IoT Integration (HiveMQ Cloud)"
    echo
    print_status "📋 Logs:"
    print_status "   • Backend: backend.log"
    print_status "   • Frontend: frontend.log"
    echo
    print_warning "💡 Press Ctrl+C to stop all services"
    echo
    
    # Keep script running and show logs
    print_status "📊 Monitoring services (Ctrl+C to stop)..."
    
    # Monitor processes
    while kill -0 $BACKEND_PID 2>/dev/null && kill -0 $FRONTEND_PID 2>/dev/null; do
        sleep 5
    done
    
    print_error "One or more services stopped unexpectedly!"
}

# Run main function
main