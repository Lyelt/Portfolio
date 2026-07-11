# Performance Follow-ups

## Bowling session pagination

`Bowling/GetDashboard` returns every session in the selected filter range so the existing View Games workflow remains unchanged. Add server-side session pagination when the Angular view can request pages without changing the chart and statistics calculations, which still need the complete filtered game set.
