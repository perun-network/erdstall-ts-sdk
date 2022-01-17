// SPDX-License-Identifier: Apache-2.0
"use strict";

import { sdkActions } from "./sdk_actions";
import { endToEndTestHarness } from "./test_harness";

describe("Erdstall-TS-SDK", endToEndTestHarness(sdkActions));
