import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    Tooltip as ChartTooltip,
    Title,
    BarElement,
    Legend,
  } from 'chart.js';
import { useContext, useMemo } from 'react';
import { JournalSliceContext } from '@/contexts/JournalSliceContext';
import { alpha, Card, CardContent, CardMedia, Chip, Skeleton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { formatBasisPointsDiff, getPriceString, PriceStringOptions } from '@/utils/string';
import { InfoOutlined, TrendingDown, TrendingFlat, TrendingUp } from '@mui/icons-material';
import { JournalContext } from '@/contexts/JournalContext';
import { Category } from '@/schema/documents/Category';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

interface DollarDisplayWithTrendProps {
    price: number
    label: string
    color?: string
    priceStringOptions?: Partial<PriceStringOptions>
    diff?: {
        basisPoints: number
        description: string
    }
}

const POSITIVE_TREND_BP_THRESHOLD = 400
const NEGATIVE_TREND_BP_THRESHOLD = -400

export function DollarDisplayWithTrend(props: DollarDisplayWithTrendProps) {
    const theme = useTheme()

    let diffColor: undefined | 'success' | 'error' = undefined
    let trendIcon = <TrendingFlat />
    if (props.diff) {
        if (props.diff.basisPoints >= POSITIVE_TREND_BP_THRESHOLD) {
            diffColor = "success"
            trendIcon = <TrendingUp />
        } else if (props.diff.basisPoints <= NEGATIVE_TREND_BP_THRESHOLD) {
            diffColor = "error"
            trendIcon = <TrendingDown />
        }
    }

    return (
        <Stack>
            <Typography variant='overline' sx={{ lineHeight: '1' }}>{props.label}</Typography>
            <Typography color={props.color} sx={{ fontWeight: 500 }}>
                {getPriceString(props.price, props.priceStringOptions)}
            </Typography>
            {props.diff && (
                <Stack direction='row' alignItems='center' gap={0.5} mr={-1}>
                    <Chip
                        color={diffColor}
                        sx={{
                            backgroundColor: diffColor ? alpha(theme.palette[diffColor].main, 0.325) : undefined,
                            color: diffColor ? theme.palette.getContrastText(theme.palette.background.paper) : undefined,
                        }}
                        label={formatBasisPointsDiff(props.diff.basisPoints)}
                        icon={trendIcon}
                        size='small'
                    />
                    <Tooltip title={props.diff.description}>
                        <InfoOutlined fontSize='small' sx={{ cursor: 'pointer' }} />
                    </Tooltip>
                </Stack>
            )}
        </Stack>
    )
}

export default function CategorySpreadChart() {

    const journalSliceContext = useContext(JournalSliceContext)
    const journalContext = useContext(JournalContext)

    const theme = useTheme()

    const { analyticsQuery } = journalSliceContext;
    const { chart } = analyticsQuery.data.basic

    const { chartOptions, chartData } = useMemo(() => {
        let uncategorizedAmount: number = 0
        // const data: number[] = []
        // const label: string[] = []
        // const borderColor: (string | undefined)[] = []
        // const backgroundColor: (string | undefined)[] = []

        const datasets: any[] = []

        Object.entries(analyticsQuery.data.categories.spendByCategoryId)
            .filter(([_, amount]) => Boolean(amount))
            .sort(([_, amountA], [__, amountB]) => {
                return amountB - amountA
            })
            .forEach(([categoryId, amount]) => {
                const category: Category | null = journalContext.getCategoriesQuery.data[categoryId] ?? null
                if (category) {
                    const color = category.avatar.primaryColor
                    // data.push(amount)
                    // label.push(category.label)
                    // borderColor.push(color)
                    // backgroundColor.push(alpha(color, 0.5))
                    datasets.push({
                        data: [amount],
                        label: category.label,
                        borderColor: color, 
                        backgroundColor: alpha(color, 0.5),
                        barThickness: 20
                    })
                } else {
                    uncategorizedAmount += amount
                }
            })

        const chartData: any = {
            labels: ['Spend by category'],
            datasets,
            // [
            //     {
            //         data,
            //         label,
            //         borderColor,
            //         backgroundColor,
            //         stack: 'Spend by category',
            //     },
            // ],
        }

        const chartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                  stacked: true,
                //   beginAtZero: true,
                  display: false,
                },
                y: {
                  stacked: true,
                //   beginAtZero: true,
                  display: false,
                },
            },
            indexAxis: 'y',
            maintainAspectRatio: false,
        }

        return { chartData, chartOptions }
    }, [chart])

    const isLoading = !analyticsQuery.isFetched || analyticsQuery.isLoading || !analyticsQuery.data.basic.chart.data.length

    return (
        <Card sx={{
            borderRadius: theme.spacing(2),
            flex: 1,
        }}>
            <CardContent sx={{ pb: 0.5, position: 'relative', zIndex: 2 }}>
                <Typography variant='h6'>Spend by Category</Typography>
            </CardContent>
            {!isLoading ? (
                <CardMedia sx={{ boxSizing: 'border-box', px: 2, mx: -0.5 }}>
                    <Bar options={chartOptions as any} data={chartData} width={'100%%'} height={theme.spacing(4)} />
                </CardMedia>
            ) : (
                <Skeleton variant='rectangular' height={theme.spacing(10)} />
            )}
        </Card>
    )
}
