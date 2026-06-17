const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Bookings.tsx', 'utf8');

content = content.replace(
  'import { Calendar, Clock, MapPin, Loader2, MessageSquare, X, AlertTriangle, RotateCcw, Star, UserCheck } from "lucide-react";',
  'import { Calendar, Clock, MapPin, Loader2, MessageSquare, X, AlertTriangle, RotateCcw, Star, UserCheck, CheckCircle, PauseCircle, Wallet } from "lucide-react";'
);

content = content.replace(
  '  const [feedbackNoShow, setFeedbackNoShow] = useState(false);',
  '  const [feedbackNoShow, setFeedbackNoShow] = useState(false);\n  const [pauseDialogOpen, setPauseDialogOpen] = useState(null);\n  const [pauseReason, setPauseReason] = useState("");\n  const [reviewDialogOpen, setReviewDialogOpen] = useState(null);\n  const [reviewRating, setReviewRating] = useState(5);\n  const [reviewComment, setReviewComment] = useState("");'
);

const newMutations = [
'  const acceptBookingMutation = useMutation({',
'    mutationFn: async (bookingId) => {',
'      const response = await apiRequest("POST", "/api/bookings/" + bookingId + "/accept", {});',
'      return response.json();',
'    },',
'    onSuccess: () => {',
'      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });',
'      refetch();',
'      toast({ title: "Job Accepted", description: "The customer has been notified." });',
'    },',
'    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),',
'  });',
'',
'  const pauseBookingMutation = useMutation({',
'    mutationFn: async ({ bookingId, reason }) => {',
'      const response = await apiRequest("POST", "/api/bookings/" + bookingId + "/pause", { reason });',
'      return response.json();',
'    },',
'    onSuccess: () => {',
'      setPauseDialogOpen(null);',
'      setPauseReason("");',
'      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });',
'      refetch();',
'      toast({ title: "Job Paused", description: "The customer has been notified." });',
'    },',
'    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),',
'  });',
'',
'  const submitReviewMutation = useMutation({',
'    mutationFn: async ({ bookingId, rating, comment }) => {',
'      const response = await apiRequest("POST", "/api/reviews", { bookingId, rating, comment });',
'      return response.json();',
'    },',
'    onSuccess: () => {',
'      setReviewDialogOpen(null);',
'      setReviewRating(5);',
'      setReviewComment("");',
'      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });',
'      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });',
'    },',
'    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),',
'  });',
'',
'  const getStatusColor',
].join('\n');

content = content.replace('  const getStatusColor', newMutations);
fs.writeFileSync('client/src/pages/Bookings.tsx', content);
console.log('Paso 1 listo');
