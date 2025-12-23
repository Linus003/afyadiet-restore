module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearSessionCookie",
    ()=>clearSessionCookie,
    "createSession",
    ()=>createSession,
    "getSessionFromCookie",
    ()=>getSessionFromCookie,
    "setSessionCookie",
    ()=>setSessionCookie,
    "verifySession",
    ()=>verifySession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/sign.js [app-route] (ecmascript)");
;
;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production");
async function createSession(payload) {
    // 💡 FIX: Spread payload into a new object to satisfy Type 'JWTPayload' requirements
    const token = await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"]({
        ...payload
    }).setProtectedHeader({
        alg: "HS256"
    }).setExpirationTime("7d").sign(JWT_SECRET);
    return token;
}
async function verifySession(token) {
    try {
        const verified = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, JWT_SECRET);
        return verified.payload;
    } catch (err) {
        return null;
    }
}
async function setSessionCookie(token) {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.set("session", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/"
    });
}
async function getSessionFromCookie() {
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const token = cookieStore.get("session")?.value;
        if (!token) return null;
        return await verifySession(token);
    } catch (err) {
        return null;
    }
}
async function clearSessionCookie() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.delete("session");
}
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db,
    "getSql",
    ()=>getSql
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = /*TURBOPACK member replacement*/ __turbopack_context__.g;
const db = globalForPrisma.prisma || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: [
        'query'
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = db;
function getSql() {
    return async (query, params = [])=>{
        // 1. Convert Postgres syntax ($1, $2, etc) to MySQL syntax (?)
        let mysqlQuery = query.replace(/\$\d+/g, '?');
        // 2. Convert Postgres 'ILIKE' (Case Insensitive) to MySQL 'LIKE' (Default is case insensitive)
        mysqlQuery = mysqlQuery.replace(/ILIKE/gi, 'LIKE');
        // 3. Remove "RETURNING *" statements
        // MySQL crashes if you try to use RETURNING, so we strip it out.
        // WARNING: This means INSERT/UPDATE operations won't return the new data immediately.
        mysqlQuery = mysqlQuery.replace(/RETURNING \*|RETURNING \w+/gi, '');
        try {
            // 4. Execute the raw query using Prisma
            // Note: We use db.$queryRawUnsafe because we are manually building the query string
            const result = await db.$queryRawUnsafe(mysqlQuery, ...params);
            // 5. Ensure we return an array (Prisma sometimes returns objects for metadata)
            if (Array.isArray(result)) {
                return result;
            }
            // If it's an INSERT/UPDATE result in MySQL, it's not an array of rows.
            // We return an empty array to prevent the app from crashing when it tries to read result[0].
            return [];
        } catch (error) {
            console.error("SQL Adapter Error:", error);
            throw error;
        }
    };
}
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/app/api/nutritionist/profile/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/session.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
;
;
// 💡 HELPER: Convert Base64 String to a Physical File
const saveFile = (base64String, userId)=>{
    try {
        // 1. If it's already a URL (not base64), just return it
        if (!base64String || !base64String.startsWith("data:")) return base64String;
        // 2. Parse the Base64 data
        const match = base64String.match(/^data:(.+);base64,(.+)$/);
        if (!match) throw new Error("Invalid file data");
        const mimeType = match[1];
        const base64Data = match[2];
        // Determine extension (pdf or image)
        const ext = mimeType.includes("pdf") ? "pdf" : "png";
        // 3. Create a unique filename
        const fileName = `kndi_${userId}_${Date.now()}.${ext}`;
        const uploadDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "public/uploads");
        // 4. Ensure the 'public/uploads' folder exists
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(uploadDir)) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(uploadDir, {
                recursive: true
            });
        }
        // 5. Write the file to disk
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(uploadDir, fileName), base64Data, "base64");
        // 6. Return the clean URL for the database
        return `/uploads/${fileName}`;
    } catch (e) {
        console.error("File save error:", e);
        return null;
    }
};
async function GET() {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSessionFromCookie"])();
        if (!session || session.role !== "nutritionist") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unauthorized access"
            }, {
                status: 401
            });
        }
        const userId = parseInt(session.userId, 10);
        if (isNaN(userId)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid User ID in session"
            }, {
                status: 400
            });
        }
        const profile = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].nutritionist.findUnique({
            where: {
                userId: userId
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        avatar_url: true
                    }
                }
            }
        });
        if (!profile) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                profile: null
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            profile: {
                ...profile,
                full_name: profile.user.name,
                email: profile.user.email,
                avatar_url: profile.user.avatar_url,
                years_experience: profile.experience_years,
                // Send expiry date to frontend
                license_expires_at: profile.license_expires_at
            }
        });
    } catch (error) {
        console.error("[v0] Profile GET error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to load profile. " + error.message
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSessionFromCookie"])();
        if (!session || session.role !== "nutritionist") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unauthorized access"
            }, {
                status: 401
            });
        }
        const userId = parseInt(session.userId, 10);
        if (isNaN(userId)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid User ID"
            }, {
                status: 400
            });
        }
        const body = await request.json();
        const { bio, specializations, certifications, yearsExperience, hourlyRate, avatarUrl, kndiDocumentUrl, licenseExpiresAt } = body;
        if (!bio || bio.length < 10) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Bio is too short. Please write at least 10 characters."
            }, {
                status: 400
            });
        }
        // 💡 HERE IS THE FIX: Convert the Base64 doc to a File URL
        const cleanDocUrl = kndiDocumentUrl ? saveFile(kndiDocumentUrl, userId) : null;
        const specialtyString = Array.isArray(specializations) ? specializations.join(", ") : specializations || "";
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].$transaction(async (tx)=>{
            if (avatarUrl) {
                await tx.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        avatar_url: avatarUrl
                    }
                });
            }
            const updatedProfile = await tx.nutritionist.upsert({
                where: {
                    userId: userId
                },
                update: {
                    bio,
                    specialty: specialtyString,
                    certifications,
                    experience_years: parseInt(yearsExperience || 0),
                    hourly_rate: parseFloat(hourlyRate || 0),
                    // Save the clean URL (e.g., /uploads/file.pdf), NOT the huge base64 string
                    kndi_document_url: cleanDocUrl,
                    license_expires_at: licenseExpiresAt ? new Date(licenseExpiresAt) : null,
                    verification_status: cleanDocUrl ? "submitted" : "pending"
                },
                create: {
                    userId: userId,
                    bio,
                    specialty: specialtyString || 'General',
                    certifications,
                    experience_years: parseInt(yearsExperience || 0),
                    hourly_rate: parseFloat(hourlyRate || 0),
                    is_verified: false,
                    // Save the clean URL here too
                    kndi_document_url: cleanDocUrl,
                    license_expires_at: licenseExpiresAt ? new Date(licenseExpiresAt) : null,
                    verification_status: cleanDocUrl ? "submitted" : "pending"
                }
            });
            return updatedProfile;
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            profile: result
        });
    } catch (error) {
        console.error("[v0] Profile PUT error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Save failed: " + error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b239fcd5._.js.map