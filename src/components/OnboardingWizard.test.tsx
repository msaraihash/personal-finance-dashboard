import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';

import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

import { OnboardingWizard } from './OnboardingWizard';
import { calculateOntarioTax } from '../services/tax';

// Mock dependencies
vi.mock('../services/tax', () => ({
    calculateOntarioTax: vi.fn(),
}));

describe('OnboardingWizard Financial Goals (Minimal V3)', () => {
    const onComplete = vi.fn();
    const onFinancialGoalsSet = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (calculateOntarioTax as Mock).mockReturnValue(0.30);
    });

    afterEach(() => {
        cleanup();
    });

    const renderGoalsStep = async () => {
        // Need to navigate to goals step first
        const { container } = render(
            <OnboardingWizard
                onComplete={onComplete}
                onFinancialGoalsSet={onFinancialGoalsSet}
            />
        );

        // Welcome -> Get Started
        const startBtn = screen.getByText(/Get Started/i);
        fireEvent.click(startBtn);

        // Philosophy -> Next
        // Need to verify wait for philosophy step
        // Just click Next: Financial Goals
        const nextBtn = screen.getByText(/Next: Financial Goals/i);
        fireEvent.click(nextBtn);

        return container;
    };

    it('renders only the 3 minimal inputs: Current Age, Retirement Age, Gross Income', async () => {
        await renderGoalsStep();

        expect(screen.getByText('Current Age')).toBeTruthy();
        expect(screen.getByText('Retirement Age')).toBeTruthy();
        expect(screen.getByText('Gross Annual Income (CAD)')).toBeTruthy();

        // Assuming Savings Rate INPUT is gone (only text in assumptions)
        // We check that there is NO slider/input for savings rate
        // The simplified UI has "Savings Rate: 20%" in a read-only assumption box, but no input.
        // Let's verify no number input or range input for savings rate exists.
        const inputs = screen.getAllByRole('spinbutton'); // Number inputs
        // Should be Age, RetAge, GrossIncome -> 3 inputs
        expect(inputs.length).toBe(3);

        expect(screen.queryByText('Show Advanced Options')).toBeNull();
    });

    it('calculates tax rate implicitly when income changes', async () => {
        (calculateOntarioTax as Mock).mockReturnValue(0.35);

        await renderGoalsStep();

        const incomeInput = screen.getByPlaceholderText('120000');
        fireEvent.change(incomeInput, { target: { value: '200000' } });

        await waitFor(() => {
            expect(calculateOntarioTax).toHaveBeenCalledWith(200000);
        });

        const taxText = screen.getByText(/Tax Rate \(ON\):/);
        expect(taxText.textContent).toContain('35.0%');
    });

    it('submits correctly constructed financial goals object with implicit defaults', async () => {
        (calculateOntarioTax as Mock).mockReturnValue(0.30);
        await renderGoalsStep();

        // Defaults: Age 30, Ret 55, Inc 120k
        // Submit
        const nextBtn = screen.getByText(/Next: Import Data/i);
        fireEvent.click(nextBtn);

        expect(onFinancialGoalsSet).toHaveBeenCalledWith(expect.objectContaining({
            currentAge: 30,
            targetRetirementAge: 55,
            grossIncomeAnnual: 120000,
            taxRate: 0.30,
            savingsRate: 0.20, // IMPLICIT CONSTANT
            realReturn: 0.05, // IMPLICIT CONSTANT
            safeWithdrawalRate: 0.04, // IMPLICIT CONSTANT
        }));
    });
});
