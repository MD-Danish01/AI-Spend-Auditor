# METRICS.md

## North Star Metric

The North Star metric for AI Spend Auditor is:

```text
Completed audits with a saved report
```

This is the best metric because the product only creates real value when a user completes the audit and finds the result useful enough to save or receive by email. A page view alone does not prove value. Even an audit start does not prove value. A completed and saved audit shows that the user trusted the result enough to keep it.

This metric also connects product value with business value. A saved report means the user has seen the recommendations, understood the estimated savings, and shared contact information after receiving value.

## Input Metrics

1. Audit Start Rate

`audit_started / landing_page_viewed`

This shows whether the landing page clearly explains the value of the tool. If this number is low, the headline, CTA, or positioning may be weak.

2. Audit Completion Rate

`audit_generated / audit_started`

This shows whether the input form is easy enough to complete. If users start but do not finish, the form may be too long, confusing, or asking for information users do not have.

3. Lead Capture Rate After Result

`lead_submitted / audit_generated`

This shows whether the result page is valuable and trustworthy enough for users to save the report. This is more meaningful than capturing email before showing value.

## Additional Useful Metrics

public_report_viewed
share_link_clicked
email_sent
high_savings_report_generated

These help measure whether the public report is useful, whether users are sharing audits, and whether high-savings cases are appearing.

## First Events to Instrument

The first analytics events I would instrument are:

landing_page_viewed
audit_started
tool_added
audit_generated
public_report_viewed
lead_submitted
email_sent
share_link_clicked

These events cover the full product funnel from first visit to saved report.

The most important early drop-off points are:

landing_page_viewed -> audit_started
audit_started -> audit_generated
audit_generated -> lead_submitted

If users do not start the audit, the landing page needs improvement. If users start but do not complete, the form needs improvement. If users complete but do not submit their email, the result page may not feel useful enough.

## Pivot Triggers

If 100 completed audits produce fewer than 5 saved reports, the result page is probably not valuable or trustworthy enough. In that case, I would improve the recommendation quality, result page copy, and explanation of savings.

If the audit start rate is below 10%, the landing page or CTA is weak. The product may need a clearer headline, a sample report preview, or a stronger explanation of the problem.

If the audit completion rate is below 40%, the form is likely too long or confusing. I would reduce required fields, improve helper text, add better defaults, or allow users to enter approximate spend.

If the lead capture rate after result is below 10%, users may not trust the report enough to save it. I would add clearer reasoning, better pricing citations, and more transparent privacy copy.

## What I Would Track Later

Later, I would track more detailed product and business metrics:

average_monthly_ai_spend
average_estimated_savings
average_savings_rate
most_common_tools
most_common_recommendation_types
high_savings_report_rate
email_delivery_success_rate

I would also track conversion from high-savings audit to actual conversation or follow-up. This matters because not every saved report has equal value. A user saving a report with $20/month spend is different from a team saving a report with $2,000/month spend.

The long-term goal is not just more traffic. The goal is more completed audits from users with meaningful AI spend and clear optimization opportunities.
