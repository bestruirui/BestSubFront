import { useState } from 'react'
import { Controller, Control } from 'react-hook-form'
import { Label } from '@/src/components/ui/label'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'

interface CountrySectionProps {
    control: Control<Record<string, unknown> | any>
    fieldName: string
}

const POPULAR_COUNTRIES = [
    { code: 'CN', name: '中国' },
    { code: 'US', name: '美国' },
    { code: 'JP', name: '日本' },
    { code: 'KR', name: '韩国' },
    { code: 'HK', name: '香港' },
    { code: 'TW', name: '台湾' },
    { code: 'SG', name: '新加坡' },
    { code: 'GB', name: '英国' },
    { code: 'DE', name: '德国' },
    { code: 'FR', name: '法国' },
] as const

const ALL_COUNTRIES = [
    ...POPULAR_COUNTRIES,
    { code: 'RU', name: '俄罗斯' },
    { code: 'IN', name: '印度' },
    { code: 'BR', name: '巴西' },
    { code: 'AU', name: '澳大利亚' },
    { code: 'IT', name: '意大利' },
    { code: 'ES', name: '西班牙' },
    { code: 'NL', name: '荷兰' },
    { code: 'SE', name: '瑞典' },
    { code: 'NO', name: '挪威' },
    { code: 'CH', name: '瑞士' },
    { code: 'AT', name: '奥地利' },
    { code: 'BE', name: '比利时' },
    { code: 'DK', name: '丹麦' },
    { code: 'FI', name: '芬兰' },
    { code: 'GR', name: '希腊' },
    { code: 'PL', name: '波兰' },
    { code: 'PT', name: '葡萄牙' },
    { code: 'CZ', name: '捷克' },
    { code: 'HU', name: '匈牙利' },
    { code: 'TR', name: '土耳其' },
    { code: 'IL', name: '以色列' },
    { code: 'AE', name: '阿联酋' },
    { code: 'MY', name: '马来西亚' },
    { code: 'TH', name: '泰国' },
    { code: 'VN', name: '越南' },
    { code: 'ID', name: '印尼' },
    { code: 'PH', name: '菲律宾' },
    { code: 'CA', name: '加拿大' },
    { code: 'MX', name: '墨西哥' },
    { code: 'AR', name: '阿根廷' },
    { code: 'ZA', name: '南非' },
    { code: 'EG', name: '埃及' },
    { code: 'SA', name: '沙特阿拉伯' },
    { code: 'IR', name: '伊朗' },
    { code: 'PK', name: '巴基斯坦' },
    { code: 'BD', name: '孟加拉国' },
    { code: 'NG', name: '尼日利亚' },
    { code: 'KE', name: '肯尼亚' },
    /* { 待补充  }*/
] as const

export function CountrySection({ control, fieldName }: CountrySectionProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [showSearchResults, setShowSearchResults] = useState(false)

    return (
        <Controller
            name={fieldName}
            control={control}
            render={({ field }) => {
                const selectedCodes = (field.value as string[]) || []

                const handleAddCountry = (code: string) => {
                    if (!selectedCodes.includes(code)) {
                        field.onChange([...selectedCodes, code])
                    }
                    setSearchTerm('')
                    setShowSearchResults(false)
                }

                const handleRemoveCountry = (code: string) => {
                    field.onChange(selectedCodes.filter(c => c !== code))
                }

                const getCountryName = (code: string) => {
                    const country = ALL_COUNTRIES.find(c => c.code === code)
                    return country ? country.name : code
                }

                const filteredCountries = ALL_COUNTRIES
                    .filter(country =>
                        !selectedCodes.includes(country.code) &&
                        (country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            country.code.includes(searchTerm))
                    )
                    .slice(0, 10)

                return (
                    <div className="w-full">
                        <Label className="mb-2 block">
                            国家
                        </Label>

                        {selectedCodes.length > 0 && (
                            <div className="mb-3">
                                <div className="text-xs text-muted-foreground mb-1">已选择:</div>
                                <div className="flex flex-wrap gap-1">
                                    {selectedCodes.map(code => (
                                        <Badge
                                            key={code}
                                            variant="secondary"
                                            className="cursor-pointer hover:bg-red-100 hover:text-red-700"
                                            onClick={() => handleRemoveCountry(code)}
                                        >
                                            {getCountryName(code)} ({code}) ×
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-3">
                            <div className="text-xs text-muted-foreground mb-1">常用国家:</div>
                            <div className="flex flex-wrap gap-1">
                                {POPULAR_COUNTRIES.map(country => {
                                    const isSelected = selectedCodes.includes(country.code)
                                    return (
                                        <Badge
                                            key={country.code}
                                            variant={isSelected ? "default" : "outline"}
                                            className={`cursor-pointer transition-colors ${isSelected
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-green-100 hover:text-green-700"
                                                }`}
                                            onClick={() => !isSelected && handleAddCountry(country.code)}
                                        >
                                            {country.name} {isSelected ? '' : '+'}
                                        </Badge>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="text-xs text-muted-foreground mb-1">搜索其他国家:</div>
                            <Input
                                placeholder="输入国家名称或二字母代码（如CN、US）..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setShowSearchResults(e.target.value.length > 0)
                                }}
                                onFocus={() => setShowSearchResults(searchTerm.length > 0)}
                                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                            />

                            {showSearchResults && filteredCountries.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {filteredCountries.map(country => (
                                        <div
                                            key={country.code}
                                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleAddCountry(country.code)}
                                        >
                                            {country.name} ({country.code})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }}
        />
    )
} 