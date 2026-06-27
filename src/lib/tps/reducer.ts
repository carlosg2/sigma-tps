import type {
  AppState, AppAction, BOMRevision, BOMDiff, BOMComponent, Article
} from "./types"

function calcArticleCompleteness(article: Partial<Article>): number {
  const fields = [
    { val: article.description, w: 10 },
    { val: article.udmBase, w: 5 },
    { val: article.group, w: 5 },
    { val: article.supplierId, w: 15 },
    { val: article.price && article.price > 0, w: 15 },
    { val: article.udmPurchase, w: 5 },
    { val: article.leadTimeDays && article.leadTimeDays > 0, w: 10 },
    { val: article.location, w: 5 },
    { val: article.udmStorage, w: 5 },
    { val: article.udmProduction, w: 5 },
    { val: article.qualityGroup, w: 10 },
    { val: article.drawingRef, w: 5 },
    { val: article.route, w: 3 },
    { val: article.workCenter, w: 2 },
  ]
  const total = fields.reduce((sum, f) => sum + f.w, 0)
  const earned = fields.reduce((sum, f) => sum + (f.val ? f.w : 0), 0)
  return Math.round((earned / total) * 100)
}

function calcBOMHealth(components: BOMComponent[]): number {
  if (components.length === 0) return 0
  const complete = components.filter(c => c.hasCompleteData).length
  return Math.round((complete / components.length) * 100)
}

export function appReducer(state: AppState, action: AppAction): AppState {
  const now = new Date().toISOString()

  switch (action.type) {
    // --- Articulos ---
    case "ADD_ARTICLE": {
      const article = { ...action.payload, completeness: calcArticleCompleteness(action.payload) }
      return { ...state, articles: [...state.articles, article], lastUpdated: now }
    }
    case "UPDATE_ARTICLE": {
      const articles = state.articles.map(a => {
        if (a.id !== action.payload.id) return a
        const updated = { ...a, ...action.payload.updates, updatedAt: now.split("T")[0] }
        updated.completeness = calcArticleCompleteness(updated)
        return updated
      })
      // Update BOM component hasCompleteData
      const boms = state.boms.map(b => ({
        ...b,
        components: b.components.map(c => {
          const art = articles.find(a => a.id === c.articleId)
          return art ? { ...c, hasCompleteData: art.completeness >= 80, articleCode: art.code, articleDescription: art.description } : c
        }),
      }))
      boms.forEach(b => { b.healthPercent = calcBOMHealth(b.components) })
      return { ...state, articles, boms, lastUpdated: now }
    }
    case "DELETE_ARTICLE": {
      return { ...state, articles: state.articles.filter(a => a.id !== action.payload), lastUpdated: now }
    }
    case "IMPORT_ARTICLES": {
      const newArticles = action.payload.map(a => ({ ...a, completeness: calcArticleCompleteness(a) }))
      return { ...state, articles: [...state.articles, ...newArticles], lastUpdated: now }
    }

    // --- BOMs ---
    case "ADD_BOM": {
      const bom = { ...action.payload, healthPercent: calcBOMHealth(action.payload.components) }
      return { ...state, boms: [...state.boms, bom], lastUpdated: now }
    }
    case "UPDATE_BOM": {
      const boms = state.boms.map(b => {
        if (b.id !== action.payload.id) return b
        const oldComponents = b.components
        const updated = { ...b, ...action.payload.updates, updatedAt: now.split("T")[0] }
        // Create revision
        if (action.payload.reason) {
          const newVersion = b.version + 1
          const diff: BOMDiff[] = []
          const newComponents = updated.components || oldComponents
          // Detect changes
          newComponents.forEach(nc => {
            const oc = oldComponents.find(c => c.id === nc.id)
            if (!oc) diff.push({ type: "added", articleCode: nc.articleCode, articleDescription: nc.articleDescription })
            else if (JSON.stringify(oc) !== JSON.stringify(nc)) {
              diff.push({ type: "modified", articleCode: nc.articleCode, articleDescription: nc.articleDescription, field: "cantidad/UdM", oldValue: `${oc.quantity} ${oc.udm}`, newValue: `${nc.quantity} ${nc.udm}` })
            }
          })
          oldComponents.forEach(oc => {
            if (!newComponents.find(nc => nc.id === oc.id)) {
              diff.push({ type: "removed", articleCode: oc.articleCode, articleDescription: oc.articleDescription })
            }
          })
          const revision: BOMRevision = {
            id: `rev-${Date.now()}`,
            bomId: b.id,
            version: newVersion,
            changedBy: state.currentUser.name,
            changedAt: now.split("T")[0],
            changeReason: action.payload.reason,
            componentsSnapshot: oldComponents,
            diff,
          }
          updated.version = newVersion
          updated.revisions = [...(b.revisions || []), revision]
        }
        updated.healthPercent = calcBOMHealth(updated.components)
        return updated
      })
      return { ...state, boms, lastUpdated: now }
    }
    case "ADD_BOM_COMPONENT": {
      const boms = state.boms.map(b => {
        if (b.id !== action.payload.bomId) return b
        const components = [...b.components, action.payload.component]
        return { ...b, components, healthPercent: calcBOMHealth(components), updatedAt: now.split("T")[0] }
      })
      return { ...state, boms, lastUpdated: now }
    }
    case "REMOVE_BOM_COMPONENT": {
      const boms = state.boms.map(b => {
        if (b.id !== action.payload.bomId) return b
        const components = b.components.filter(c => c.id !== action.payload.componentId)
        return { ...b, components, healthPercent: calcBOMHealth(components), updatedAt: now.split("T")[0] }
      })
      return { ...state, boms, lastUpdated: now }
    }
    case "UPDATE_BOM_COMPONENT": {
      const boms = state.boms.map(b => {
        if (b.id !== action.payload.bomId) return b
        const components = b.components.map(c =>
          c.id === action.payload.componentId ? { ...c, ...action.payload.updates } : c
        )
        return { ...b, components, healthPercent: calcBOMHealth(components), updatedAt: now.split("T")[0] }
      })
      return { ...state, boms, lastUpdated: now }
    }
    case "REORDER_BOM_COMPONENTS": {
      const boms = state.boms.map(b => {
        if (b.id !== action.payload.bomId) return b
        return { ...b, components: action.payload.components, updatedAt: now.split("T")[0] }
      })
      return { ...state, boms, lastUpdated: now }
    }
    case "MOVE_BOM_COMPONENT": {
      const { bomId, componentId, newParentId, newOrder } = action.payload
      const boms = state.boms.map(b => {
        if (b.id !== bomId) return b
        const components = b.components.map(c => {
          if (c.id !== componentId) return c
          // Calculate new level based on parent
          const parent = newParentId ? b.components.find(p => p.id === newParentId) : null
          const newLevel = parent ? parent.level + 1 : 0
          return { ...c, parentId: newParentId, order: newOrder, level: newLevel }
        })
        // Reorder siblings at same level under same parent
        const siblings = components.filter(c => c.parentId === newParentId)
        siblings.sort((a, b) => a.order - b.order)
        siblings.forEach((s, idx) => { s.order = idx })
        return { ...b, components, updatedAt: now.split("T")[0] }
      })
      return { ...state, boms, lastUpdated: now }
    }
    case "CREATE_BOM_VERSION": {
      const { bomId, reason } = action.payload
      const boms = state.boms.map(b => {
        if (b.id !== bomId) return b
        const newVersion = b.version + 1
        const revision: BOMRevision = {
          id: `rev-${Date.now()}`,
          bomId: b.id,
          version: newVersion,
          changedBy: state.currentUser.name,
          changedAt: now.split("T")[0],
          changeReason: reason,
          componentsSnapshot: b.components,
          diff: [],
        }
        return {
          ...b,
          version: newVersion,
          revisions: [...b.revisions, revision],
          updatedAt: now.split("T")[0],
        }
      })
      return { ...state, boms, lastUpdated: now }
    }
    case "MASS_CHANGE_COMPONENT": {
      const { oldArticleId, newArticleId, bomIds, reason } = action.payload
      const newArticle = state.articles.find(a => a.id === newArticleId)
      if (!newArticle) return state
      const boms = state.boms.map(b => {
        if (!bomIds.includes(b.id)) return b
        const oldComponents = b.components
        const components = b.components.map(c => {
          if (c.articleId !== oldArticleId) return c
          return { ...c, articleId: newArticleId, articleCode: newArticle.code, articleDescription: newArticle.description, hasCompleteData: newArticle.completeness >= 80 }
        })
        const newVersion = b.version + 1
        const revision: BOMRevision = {
          id: `rev-mc-${Date.now()}-${b.id}`,
          bomId: b.id,
          version: newVersion,
          changedBy: state.currentUser.name,
          changedAt: now.split("T")[0],
          changeReason: reason,
          componentsSnapshot: oldComponents,
          diff: [{ type: "modified", articleCode: newArticle.code, articleDescription: newArticle.description, field: "componente", oldValue: oldArticleId, newValue: newArticleId }],
        }
        return { ...b, components, version: newVersion, revisions: [...b.revisions, revision], healthPercent: calcBOMHealth(components), updatedAt: now.split("T")[0] }
      })
      return { ...state, boms, lastUpdated: now }
    }

    // --- Proyectos ---
    case "ADD_PROJECT":
      return { ...state, projects: [...state.projects, action.payload], lastUpdated: now }
    case "UPDATE_PROJECT": {
      const projects = state.projects.map(p =>
        p.id === action.payload.id ? { ...p, ...action.payload.updates, updatedAt: now.split("T")[0] } : p
      )
      return { ...state, projects, lastUpdated: now }
    }
    case "ADD_PROJECT_COST": {
      const projects = state.projects.map(p => {
        if (p.id !== action.payload.projectId) return p
        const costs = [...p.costs, action.payload.cost]
        const totalCost = costs.reduce((sum, c) => sum + c.amount, 0)
        const estimatedMargin = p.quotationAmount > 0 ? Math.round(((p.quotationAmount - totalCost) / p.quotationAmount) * 1000) / 10 : 0
        return { ...p, costs, totalCost, estimatedMargin }
      })
      return { ...state, projects, lastUpdated: now }
    }
    case "UPDATE_PROJECT_STAGE": {
      const projects = state.projects.map(p => {
        if (p.id !== action.payload.projectId) return p
        const stages = p.stages.map(s =>
          s.name === action.payload.stageName ? { ...s, ...action.payload.updates } : s
        )
        return { ...p, stages }
      })
      return { ...state, projects, lastUpdated: now }
    }

    // --- GAPs ---
    case "ADD_GAP":
      return { ...state, gaps: [...state.gaps, action.payload], lastUpdated: now }
    case "UPDATE_GAP": {
      const gaps = state.gaps.map(g =>
        g.id === action.payload.id ? { ...g, ...action.payload.updates, updatedAt: now.split("T")[0] } : g
      )
      return { ...state, gaps, lastUpdated: now }
    }

    // --- Decisiones ---
    case "ADD_DECISION":
      return { ...state, decisions: [...state.decisions, action.payload], lastUpdated: now }
    case "UPDATE_DECISION": {
      const decisions = state.decisions.map(d =>
        d.id === action.payload.id ? { ...d, ...action.payload.updates } : d
      )
      return { ...state, decisions, lastUpdated: now }
    }

    // --- Checklist ---
    case "TOGGLE_CHECKLIST": {
      const checklist = state.checklist.map(item =>
        item.id === action.payload.id
          ? { ...item, completed: action.payload.completed, completedAt: action.payload.completed ? now.split("T")[0] : null, completedBy: action.payload.completed ? state.currentUser.name : "" }
          : item
      )
      return { ...state, checklist, lastUpdated: now }
    }

    // --- LMAT 2.0: Especificaciones ---
    case "ADD_SPECIFICATION":
      return { ...state, specifications: [...state.specifications, action.payload], lastUpdated: now }
    case "UPDATE_SPECIFICATION": {
      const specifications = state.specifications.map(s =>
        s.id === action.payload.id ? { ...s, ...action.payload.updates, updatedAt: now.split("T")[0] } : s
      )
      return { ...state, specifications, lastUpdated: now }
    }

    // --- LMAT 2.0: ECN ---
    case "ADD_ECN":
      return { ...state, ecns: [...state.ecns, action.payload], lastUpdated: now }
    case "UPDATE_ECN": {
      const ecns = state.ecns.map(e =>
        e.id === action.payload.id ? { ...e, ...action.payload.updates, updatedAt: now.split("T")[0] } : e
      )
      return { ...state, ecns, lastUpdated: now }
    }
    case "APPROVE_ECN": {
      const { ecnId, department, approved, notes } = action.payload
      const ecns = state.ecns.map(e => {
        if (e.id !== ecnId) return e
        const approvals = e.approvals.map(a =>
          a.department === department
            ? { ...a, status: approved ? "aprobado" as const : "rechazado" as const, approvedBy: state.currentUser.name, approvedAt: now.split("T")[0], notes }
            : a
        )
        // Check if all approved to advance status
        const allApproved = approvals.every(a => a.status === "aprobado")
        const anyRejected = approvals.some(a => a.status === "rechazado")
        let newStatus = e.status
        if (anyRejected) newStatus = "rechazado"
        else if (allApproved && e.status === "aprobacion") newStatus = "aplicacion"
        return { ...e, approvals, status: newStatus, updatedAt: now.split("T")[0] }
      })
      return { ...state, ecns, lastUpdated: now }
    }
    case "APPLY_ECN": {
      const ecns = state.ecns.map(e => {
        if (e.id !== action.payload.ecnId) return e
        return { ...e, status: "completado" as const, appliedAt: now.split("T")[0], appliedBy: state.currentUser.name, updatedAt: now.split("T")[0] }
      })
      return { ...state, ecns, lastUpdated: now }
    }

    // --- LMAT 2.0: Supply Kits ---
    case "ADD_SUPPLY_KIT":
      return { ...state, supplyKits: [...state.supplyKits, action.payload], lastUpdated: now }
    case "UPDATE_SUPPLY_KIT": {
      const supplyKits = state.supplyKits.map(k =>
        k.id === action.payload.id ? { ...k, ...action.payload.updates } : k
      )
      return { ...state, supplyKits, lastUpdated: now }
    }
    case "SCAN_KIT_ITEM": {
      const supplyKits = state.supplyKits.map(k => {
        if (k.id !== action.payload.kitId) return k
        const items = k.items.map(i =>
          i.id === action.payload.itemId
            ? { ...i, scanned: true, scannedAt: now, quantitySupplied: i.quantityBOM }
            : i
        )
        // Update status based on scanned items
        const allScanned = items.every(i => i.scanned)
        const anyScanned = items.some(i => i.scanned)
        let status = k.status
        if (allScanned) status = "listo"
        else if (anyScanned) status = "en_preparacion"
        return { ...k, items, status }
      })
      return { ...state, supplyKits, lastUpdated: now }
    }

    // --- LMAT 2.0: Validacion departamental ---
    case "UPDATE_BOM_VALIDATION": {
      const { bomId, department, status, notes } = action.payload
      const boms = state.boms.map(b => {
        if (b.id !== bomId) return b
        const departmentValidations = (b.departmentValidations || []).map(v =>
          v.department === department
            ? { ...v, status, validatedBy: state.currentUser.name, validatedAt: now.split("T")[0], notes }
            : v
        )
        // Check if validation exists, if not add it
        if (!departmentValidations.find(v => v.department === department)) {
          departmentValidations.push({
            department,
            status,
            validatedBy: state.currentUser.name,
            validatedAt: now.split("T")[0],
            notes
          })
        }
        // Update maturity status if all departments approved
        const allComplete = departmentValidations.every(v => v.status === "completado")
        let maturityStatus = b.maturityStatus
        if (allComplete && b.maturityStatus === "estabilizado") {
          maturityStatus = "liberado"
        }
        return { ...b, departmentValidations, maturityStatus, updatedAt: now.split("T")[0] }
      })
      return { ...state, boms, lastUpdated: now }
    }

    // --- LMAT 2.0: Documentos ---
    case "ADD_ARTICLE_DOCUMENT": {
      const articles = state.articles.map(a => {
        if (a.id !== action.payload.articleId) return a
        const documents = [...(a.documents || []), action.payload.document]
        return { ...a, documents, updatedAt: now.split("T")[0] }
      })
      return { ...state, articles, lastUpdated: now }
    }
    case "UPDATE_ARTICLE_DOCUMENT": {
      const articles = state.articles.map(a => {
        if (a.id !== action.payload.articleId) return a
        const documents = (a.documents || []).map(d =>
          d.id === action.payload.documentId ? { ...d, ...action.payload.updates } : d
        )
        return { ...a, documents, updatedAt: now.split("T")[0] }
      })
      return { ...state, articles, lastUpdated: now }
    }

    // --- UI ---
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload }
    case "SET_CURRENT_PLANT":
      return { ...state, currentPlant: action.payload }

    // --- Audit ---
    case "ADD_AUDIT_LOG":
      return { ...state, auditLog: [action.payload, ...state.auditLog].slice(0, 500) }

    // --- Hydrate ---
    case "HYDRATE":
      return action.payload

    default:
      return state
  }
}
