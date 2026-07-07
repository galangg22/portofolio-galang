'use client'

import { useState, useEffect, useRef } from 'react'
import {
  DndContext,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'


function ItemColumns({ item, columns, getBadgeColor, getTypeIcon }) {
  return columns.filter(col => col.key !== 'featured' && col.key !== 'sort_order').map((col, idx) => (
    <div key={idx} className="shrink-0 max-w-full">
      {col.render ? (
        col.render(item[col.key], item)
      ) : col.key === 'thumbnail_url' || col.key === 'cover_image_url' || col.key === 'image_url' ? (
        item[col.key] ? (
          <img
            src={item[col.key]}
            alt={item.title || item.name || 'Thumbnail'}
            className="w-10 h-10 object-cover rounded border border-gray-700"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
            <i className="ri-image-line text-gray-600"></i>
          </div>
        )
      ) : col.key === 'type' ? (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getBadgeColor(item[col.key])}`}>
          <i className={getTypeIcon(item[col.key])}></i>
          {item[col.key]}
        </span>
      ) : col.key === 'status' ? (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
          item[col.key] === 'completed' ? 'bg-green-900/30 text-green-400 border border-green-800/40' :
          item[col.key] === 'wip' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/40' :
          'bg-gray-700 text-gray-400 border border-gray-600'
        }`}>
          {item[col.key] || '-'}
        </span>
      ) : col.key === 'title' || col.key === 'name' ? (
        <span className="text-gray-200 text-sm font-medium truncate max-w-[200px]">{item[col.key] || '-'}</span>
      ) : typeof item[col.key] === 'boolean' ? (
        <span className={`text-xs ${item[col.key] ? 'text-green-400' : 'text-gray-600'}`}>
          {item[col.key] ? 'Yes' : 'No'}
        </span>
      ) : (
        <span className="text-gray-500 text-sm">{item[col.key] != null ? String(item[col.key]) : '-'}</span>
      )}
    </div>
  ))
}


function SortableItem({ item, onEdit, onDelete, getBadgeColor, getTypeIcon, columns }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSorting,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isSorting ? 'none' : transition,
    opacity: isSorting ? 0.4 : 1,
  }

  if (item.isDivider) {
    return (
      <div ref={setNodeRef} style={style} className={`py-6 ${isSorting ? 'z-50' : ''}`}>
        <div className="flex items-center gap-3 px-2 group cursor-grab active:cursor-grabbing touch-none" {...attributes} {...listeners} aria-label="Drag to adjust featured items">
          <div className="flex-1 border-t-2 border-dashed border-gray-600 group-hover:border-blue-500 transition-colors"></div>
          <span className="text-xs font-bold text-gray-500 group-hover:text-blue-400 transition-colors flex items-center gap-1 bg-gray-900 px-2 py-1 rounded shadow-sm">
            <i className="ri-draggable"></i>
            FEATURED DI ATAS · ARSIP DI BAWAH
          </span>
          <div className="flex-1 border-t-2 border-dashed border-gray-600 group-hover:border-blue-500 transition-colors"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-800 rounded-lg px-4 py-3 border border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Mobile Header (Drag & Actions) */}
        <div className="flex items-center justify-between sm:hidden w-full mb-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-500 hover:text-gray-300 transition-colors touch-none"
            aria-label="Drag to reorder"
          >
            <i className="ri-draggable text-xl"></i>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 text-gray-400 hover:text-blue-400 rounded transition-colors"
              aria-label={`Edit ${item.title || item.name}`}
            >
              <i className="ri-edit-line text-lg"></i>
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
              aria-label={`Delete ${item.title || item.name}`}
            >
              <i className="ri-delete-bin-line text-lg"></i>
            </button>
          </div>
        </div>

        {/* Desktop Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="hidden sm:block cursor-grab active:cursor-grabbing p-1 text-gray-600 hover:text-gray-400 transition-colors touch-none"
          aria-label="Drag to reorder"
        >
          <i className="ri-draggable text-lg"></i>
        </button>

        {/* Content */}
        <div className="flex-1 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 min-w-0">
          <ItemColumns item={item} columns={columns} getBadgeColor={getBadgeColor} getTypeIcon={getTypeIcon} />
          {item.featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-900/20 text-amber-400 border border-amber-800/30 mt-1 sm:mt-0">
              <i className="ri-star-s-fill text-[10px]"></i>
              Featured
            </span>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-gray-500 hover:text-blue-400 rounded transition-colors"
            aria-label={`Edit ${item.title || item.name}`}
          >
            <i className="ri-edit-line"></i>
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-gray-500 hover:text-red-400 rounded transition-colors"
            aria-label={`Delete ${item.title || item.name}`}
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

// Main DragDropList Component
export default function DragDropList({ data, onUpdate, onEdit, onDelete, getBadgeColor, getTypeIcon, columns: rawColumns, featuredLimit = null, enableFeaturedDrag = false }) {
  const [items, setItems] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Normalize columns: support both string[] and object[] formats
  const columns = (rawColumns || []).map(col =>
    typeof col === 'string' ? { key: col } : col
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const dataKeyRef = useRef('')

  useEffect(() => {
    const sorted = [...data].sort((a, b) => {
      const orderA = a.sort_order ?? a.id
      const orderB = b.sort_order ?? b.id
      return orderA - orderB
    })
    
    let result
    if (enableFeaturedDrag) {
      const itemsWithoutDivider = sorted.filter(item => !item.isDivider)
      let dividerIndex = itemsWithoutDivider.length
      for (let i = 0; i < itemsWithoutDivider.length; i++) {
        if (!itemsWithoutDivider[i].featured) {
          dividerIndex = i;
          break;
        }
      }
      itemsWithoutDivider.splice(dividerIndex, 0, { id: 'FEATURED_DIVIDER', isDivider: true })
      result = itemsWithoutDivider
    } else {
      result = sorted
    }

    const key = result.map(i => i.id).join(',')
    if (dataKeyRef.current !== key) {
      dataKeyRef.current = key
      setItems(result)
    }
  }, [data, enableFeaturedDrag])

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      console.error('Could not find item index', { active: active.id, over: over.id, items })
      return
    }

    const reordered = arrayMove(items, oldIndex, newIndex)

    let currentSortOrder = 0
    let isAboveDivider = true
    const updated = []
    
    for (let i = 0; i < reordered.length; i++) {
      const item = reordered[i]
      if (item.isDivider) {
        isAboveDivider = false
        continue
      }
      
      if (!item.id && item.id !== 0) {
        console.error('Item missing id during drag:', item)
      }
      
      const updatedItem = {
        ...item,
        sort_order: currentSortOrder,
      }
      
      if (enableFeaturedDrag) {
        updatedItem.featured = isAboveDivider
      } else if (featuredLimit !== null) {
        updatedItem.featured = currentSortOrder < featuredLimit
      }
      
      updated.push(updatedItem)
      currentSortOrder++
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Drag reorder complete:', updated.map(i => ({ id: i.id, sort_order: i.sort_order, featured: i.featured })))
    }

    setItems(reordered)

    setIsUpdating(true)
    try {
      await onUpdate(updated)
    } catch (error) {
      console.error('Failed to update order:', error)
      setItems(items)
    } finally {
      setIsUpdating(false)
    }
  }

  const activeItem = items.find((item) => item.id === activeId)
  const featuredCount = items.filter((item) => item.featured).length

  return (
    <div>
      {/* Updating overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9998]" role="status" aria-live="polite">
          <div className="bg-gray-800 rounded-lg px-5 py-3 flex items-center gap-3 border border-gray-700">
            <i className="ri-loader-4-line animate-spin text-xl text-gray-400" aria-hidden="true"></i>
            <span className="text-gray-300 text-sm">Saving order...</span>
          </div>
        </div>
      )}

      {/* Featured info */}
      {featuredLimit !== null && !enableFeaturedDrag && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>Top {featuredLimit} items appear as featured</span>
          <span>{featuredCount}/{featuredLimit} featured</span>
        </div>
      )}
      {enableFeaturedDrag && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>Drag pembatas (divider) untuk mengatur jumlah item featured</span>
          <span>{featuredCount} item featured</span>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="mb-1.5 last:mb-0">
                <SortableItem
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  getBadgeColor={getBadgeColor}
                  getTypeIcon={getTypeIcon}
                  columns={columns}
                  isDragging={activeId === item.id}
                />

                {/* Featured divider */}
                {featuredLimit !== null && !enableFeaturedDrag && index === featuredLimit - 1 && items.length > featuredLimit && (
                  <div className="flex items-center gap-3 my-3 px-2">
                    <div className="flex-1 border-t border-dashed border-gray-700"></div>
                    <span className="text-xs text-gray-600 shrink-0">featured above · archive below</span>
                    <div className="flex-1 border-t border-dashed border-gray-700"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SortableContext>

        {/* Drag Overlay */}

      </DndContext>
    </div>
  )
}
