{{/*
Quantum-Detailed Helm Helper Templates for GameDin Quantum Layer

This file provides reusable template functions for consistent naming, labels, and selectors across all chart resources.
It ensures maintainability, DRY principles, and best practices for Helm-based deployments.
*/}}

{{/*
Return the fully qualified name of a resource, combining release name and chart name.
Usage: {{ include "gamedin-quantum.fullname" . }}
*/}}
{{- define "gamedin-quantum.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else if .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Return the chart name, with optional override.
Usage: {{ include "gamedin-quantum.name" . }}
*/}}
{{- define "gamedin-quantum.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Return the chart version.
Usage: {{ include "gamedin-quantum.chart" . }}
*/}}
{{- define "gamedin-quantum.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Standard labels for all resources, including app, chart, release, and heritage.
Usage: {{ include "gamedin-quantum.labels" . | nindent 4 }}
*/}}
{{- define "gamedin-quantum.labels" -}}
app.kubernetes.io/name: {{ include "gamedin-quantum.name" . }}
helm.sh/chart: {{ include "gamedin-quantum.chart" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: gamedin-quantum
{{- end }}

{{/*
Selector labels for resource selectors, matching the main app instance.
Usage: {{ include "gamedin-quantum.selectorLabels" . | nindent 6 }}
*/}}
{{- define "gamedin-quantum.selectorLabels" -}}
app.kubernetes.io/name: {{ include "gamedin-quantum.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: gamedin-quantum
{{- end }}

{{/*
Return the service account name for the deployment, with optional override.
Usage: {{ include "gamedin-quantum.serviceAccountName" . }}
*/}}
{{- define "gamedin-quantum.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "gamedin-quantum.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }} 