#!/usr/bin/env python3
"""
AI-Powered E2E Test Results Analyzer

Analyzes Playwright test results and provides actionable insights
using AI to identify UX issues, performance bottlenecks, and
recommendations for improvement.

Usage:
    python scripts/analyze_e2e_results.py test-results.json
"""

import json
import sys
import os
from datetime import datetime
from pathlib import Path

# Optional: OpenAI for AI analysis
try:
    import openai
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False
    print("⚠️  OpenAI not installed. Install with: pip install openai")
    print("   Running in basic analysis mode.\n")


def load_test_results(results_file: str) -> dict:
    """Load Playwright test results from JSON file."""
    with open(results_file) as f:
        return json.load(f)


def basic_analysis(results: dict) -> dict:
    """Perform basic analysis without AI."""
    
    total = results.get('total', 0)
    passed = results.get('passed', 0)
    failed = results.get('failed', 0)
    flaky = results.get('flaky', 0)
    
    success_rate = (passed / total * 100) if total > 0 else 0
    
    # Extract performance metrics
    performance = {}
    for test in results.get('tests', []):
        if 'performance' in test:
            for key, value in test['performance'].items():
                if key not in performance:
                    performance[key] = []
                performance[key].append(value)
    
    # Calculate averages
    avg_performance = {}
    for key, values in performance.items():
        avg_performance[key] = sum(values) / len(values) if values else 0
    
    # Extract failures
    failures = []
    for test in results.get('tests', []):
        if test.get('status') == 'failed':
            failures.append({
                'test': test.get('title'),
                'error': test.get('error'),
                'file': test.get('file'),
            })
    
    return {
        'summary': {
            'total_tests': total,
            'passed': passed,
            'failed': failed,
            'flaky': flaky,
            'success_rate': round(success_rate, 2),
        },
        'performance': avg_performance,
        'failures': failures,
        'recommendations': generate_basic_recommendations(results),
    }


def generate_basic_recommendations(results: dict) -> list:
    """Generate basic recommendations based on test results."""
    recommendations = []
    
    # Check success rate
    total = results.get('total', 0)
    passed = results.get('passed', 0)
    success_rate = (passed / total * 100) if total > 0 else 0
    
    if success_rate < 80:
        recommendations.append({
            'priority': 'P0',
            'category': 'Stability',
            'issue': f'Low test success rate: {success_rate:.1f}%',
            'action': 'Fix failing tests before proceeding with user testing',
        })
    
    # Check for flaky tests
    flaky = results.get('flaky', 0)
    if flaky > 0:
        recommendations.append({
            'priority': 'P1',
            'category': 'Reliability',
            'issue': f'{flaky} flaky test(s) detected',
            'action': 'Investigate and fix flaky tests to improve confidence',
        })
    
    # Check performance
    for test in results.get('tests', []):
        if test.get('duration', 0) > 60000:
            recommendations.append({
                'priority': 'P1',
                'category': 'Performance',
                'issue': f'Slow test: {test.get("title")} ({test.get("duration")}ms)',
                'action': 'Optimize test or investigate slow page loads',
            })
    
    return recommendations


def ai_analysis(results: dict) -> dict:
    """Perform AI-powered analysis using OpenAI."""
    
    if not HAS_OPENAI:
        return {'error': 'OpenAI not available'}
    
    # Check for API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        return {'error': 'OPENAI_API_KEY not set'}
    
    openai.api_key = api_key
    
    # Prepare analysis prompt
    prompt = f"""
    You are a senior QA analyst and UX expert analyzing E2E test results for Olcan Compass, 
    a career development platform.
    
    TEST RESULTS:
    - Total tests: {results.get('total', 0)}
    - Passed: {results.get('passed', 0)}
    - Failed: {results.get('failed', 0)}
    - Flaky: {results.get('flaky', 0)}
    
    FAILED TESTS:
    {json.dumps(results.get('failures', []), indent=2)}
    
    PERFORMANCE DATA:
    {json.dumps(results.get('performance', {}), indent=2)}
    
    Please provide:
    
    1. **EXECUTIVE SUMMARY** (2-3 sentences)
       Overall health of the platform based on test results.
    
    2. **CRITICAL ISSUES** (P0 - Fix Immediately)
       List any show-stopping issues that would prevent real users from completing key flows.
    
    3. **UX IMPROVEMENTS** (P1 - High Priority)
       Specific recommendations to improve user experience based on test failures or slow performance.
    
    4. **PERFORMANCE OPTIMIZATIONS** (P1-P2)
       Suggestions to improve page load times and API response times.
    
    5. **EDGE CASES TO TEST** (P2)
       Additional test scenarios that should be added based on current test coverage gaps.
    
    6. **NEXT STEPS**
       Prioritized action items for the development team.
    
    Be specific, actionable, and prioritize issues that would impact real users.
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior QA analyst and UX expert specializing in web applications."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=2000,
        )
        
        return {
            'ai_insights': response.choices[0].message.content,
            'model': 'gpt-4',
            'timestamp': datetime.now().isoformat(),
        }
    
    except Exception as e:
        return {
            'error': f'AI analysis failed: {str(e)}',
        }


def generate_report(analysis: dict, output_file: str = 'e2e-analysis-report.md'):
    """Generate markdown report from analysis."""
    
    report = f"""# E2E Test Analysis Report

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Tool:** AI-Powered Test Analyzer  

---

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total Tests | {analysis['summary']['total_tests']} |
| Passed | {analysis['summary']['passed']} |
| Failed | {analysis['summary']['failed']} |
| Flaky | {analysis['summary']['flaky']} |
| Success Rate | {analysis['summary']['success_rate']}% |

---

## 🎯 Recommendations

"""
    
    for rec in analysis.get('recommendations', []):
        priority_emoji = {
            'P0': '🔴',
            'P1': '🟠',
            'P2': '🟡',
        }.get(rec['priority'], '⚪')
        
        report += f"""
### {priority_emoji} {rec['priority']}: {rec['category']}

**Issue:** {rec['issue']}  
**Action:** {rec['action']}

"""
    
    # Add AI insights if available
    if 'ai_insights' in analysis:
        report += f"""
---

## 🤖 AI Insights

{analysis['ai_insights']}

"""
    
    # Add failures details
    if analysis.get('failures'):
        report += """
---

## ❌ Test Failures

"""
        for failure in analysis['failures']:
            report += f"""
### {failure['test']}

**File:** {failure['file']}  
**Error:** {failure['error']}

"""
    
    # Save report
    with open(output_file, 'w') as f:
        f.write(report)
    
    return output_file


def main():
    """Main entry point."""
    
    if len(sys.argv) < 2:
        print("Usage: python analyze_e2e_results.py <results.json> [output.md]")
        sys.exit(1)
    
    results_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'e2e-analysis-report.md'
    
    # Load results
    print(f"📂 Loading test results from {results_file}...")
    results = load_test_results(results_file)
    
    # Basic analysis
    print("🔍 Performing basic analysis...")
    analysis = basic_analysis(results)
    
    # AI analysis (if available)
    if HAS_OPENAI and os.getenv('OPENAI_API_KEY'):
        print("🤖 Performing AI-powered analysis...")
        ai_results = ai_analysis(results)
        analysis.update(ai_results)
    
    # Generate report
    print(f"📝 Generating report: {output_file}...")
    report_file = generate_report(analysis, output_file)
    
    # Print summary
    print("\n" + "="*60)
    print("📊 TEST ANALYSIS SUMMARY")
    print("="*60)
    print(f"Total Tests: {analysis['summary']['total_tests']}")
    print(f"Passed: {analysis['summary']['passed']}")
    print(f"Failed: {analysis['summary']['failed']}")
    print(f"Success Rate: {analysis['summary']['success_rate']}%")
    print(f"\nReport saved to: {report_file}")
    
    # Print recommendations
    if analysis.get('recommendations'):
        print("\n🎯 TOP RECOMMENDATIONS:")
        for i, rec in enumerate(analysis['recommendations'][:3], 1):
            print(f"{i}. [{rec['priority']}] {rec['issue']}")
    
    print("\n✅ Analysis complete!")


if __name__ == '__main__':
    main()
