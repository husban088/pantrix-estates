#!/bin/sh
cd "$(dirname "$0")/dotnet-leadscore" || exit 1
dotnet run
