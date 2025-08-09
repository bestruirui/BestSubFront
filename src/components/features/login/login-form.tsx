"use client"

import { useState } from "react"
import { cn } from "@/src/utils"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { ApiError } from "@/src/lib/api/client"
import { Spinner } from "@/src/components/ui/loading"
import { useAuth } from "@/src/components/providers"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { login, isLoading } = useAuth()

    const getErrorMessage = (error: unknown): string => {
        if (error instanceof ApiError) {
            switch (error.status) {
                case 401:
                    return "用户名或密码错误"
                case 429:
                    return "登录尝试过于频繁，请稍后再试"
                case 500:
                    return "服务器错误，请稍后再试"
                default:
                    return "登录失败，请检查网络连接"
            }
        }

        if (error instanceof Error && error.message.includes('fetch')) {
            return "网络连接失败，请检查网络设置"
        }

        return "登录失败，请稍后再试"
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!username.trim() || !password) {
            setError("请输入用户名和密码")
            return
        }

        try {
            await login(username.trim(), password)
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">欢迎回来</h1>
                                <p className="text-muted-foreground text-balance">
                                    登录到您的 BestSub 账户
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-3">
                                <Label htmlFor="username">用户名</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="请输入用户名"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="password">密码</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="请输入密码"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || !username.trim() || !password}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner size="sm" className="mr-2 border-white" />
                                        登录中...
                                    </>
                                ) : (
                                    "登录"
                                )}
                            </Button>
                        </div>
                    </form>
                    <div className="bg-muted relative hidden md:block">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <h2 className="text-3xl font-bold mb-4">BestSub</h2>
                                    <p className="text-lg opacity-90">安全、高效的订阅管理平台</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="text-muted-foreground text-center text-xs text-balance">
                登录即表示您同意我们的服务条款和隐私政策
            </div>
        </div>
    )
}
